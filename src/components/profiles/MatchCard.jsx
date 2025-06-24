import { FaBolt } from "react-icons/fa";
import LoadingBadge from "../ui/LoadingBadge";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { memo, useState } from "react";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { IoChatbubble, IoPerson, IoPersonAdd, IoPersonOutline, IoPersonRemove } from "react-icons/io5";
import { ImBlocked } from "react-icons/im";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { handleStartChat } from "../social/chat/utilis/handleStartChat";
import { useProfile } from "../../context/profile/ProfileContext";
import { useConversations } from "../../context/social/chat/ConversationsContext";
import { useParticipants } from "../../context/social/chat/ParticipantsContext";

function MatchCard({ profile, loading }) {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const { 
    addConnection, 
    deleteConnection, 
    updateConnection, 
    userConnections 
  } = useUserConnections();

  const {findConversation, createConversation} = useConversations();
  const { addParticipant } = useParticipants();

  const [hoverText, setHoverText] = useState(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { fetchProfile } = useProfile();
  const { data: profileData } = fetchProfile(profile.profile_id);

  const navigate = useNavigate();

  const { data: connections } = userConnections(profile.profile_id);
  const connection = connections?.find(
    (c) =>
      (c.follower_profile_id === user.id && c.following_profile_id === profile.profile_id) ||
      (c.follower_profile_id === profile.profile_id && c.following_profile_id === user.id)
  );

  const status = connection?.status ?? "connect";

  const handleConnect = async () => {
    if (status === "connect") {
      await addConnection({
        follower_profile_id: user.id,
        following_profile_id: profile.profile_id,
        status: "pending",
      });
    } else if (status === "pending" || status === "accepted") {
      await deleteConnection(connection);
    } else if (status === "blocked") {
      await updateConnection({
        connection,
        updatedConnection: { status: "accepted" },
      });
    }
  };

  const startChat = () => {
        if(isStartingChat) return;
        handleStartChat({
          myProfileId: user.id,
          otherProfile: profileData,
          findConversation,
          createConversation,
          addParticipant,
          navigate,
          setLoading: setIsStartingChat,
        })
      }

  const percentage = Math.round(profile.match_score * 100);
  
  if (!profile || loading) return <LoadingBadge color="amber" label="Buscando músicos compatibles..." />;
  
  const badgeClasses =
    percentage >= 70
      ? "bg-amber-800 text-white"
      : percentage >= 40
      ? "bg-sky-700 text-white"
      : percentage >= 10
      ? "bg-gray-300 text-gray-900"
      : "bg-gray-800 text-gray-100";

  const getHoverText = () => {
    if (status === "pending") return t("connection.cancelRequest");
    if (status === "accepted") return t("connection.disconnect");
    if (status === "blocked") return t("connection.unblock");
    return null;
  };

  return (
    <div className="max-w-100 w-full mx-auto border border-gray-400 rounded-xl p-4 shadow-sm bg-gray-950 hover:shadow-md transition relative">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/profile/${profile.profile_id}`}>
          <img
          loading="lazy"
          src={profile.avatar_url || "/default-avatar.png"}
          alt={profile.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        </Link>
        <div>
          <div className="font-semibold text-gray-100">
            {profile.name || profile.display_name || profile.username}
          </div>
          <div className="text-sm text-gray-400">@{profile.username}</div>
        </div>
      </div>
      {/* Match Badge */}
      <div
        className={`absolute inline-flex items-center gap-2 cursor-help select-none px-3 py-1 rounded-full text-sm font-semibold ${badgeClasses}`}
        title={t("matchScore.cardTitle")}
      >
        <FaBolt className="text-amber-500 text-lg" />
        <span>Match: {percentage}%</span>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm">
        {/* Chat button */}
        <button
          onClick={startChat}
          className="absolute top-4 right-4 text-amber-700 cursor-pointer hover:text-amber-800 transition"
        >
          <IoChatbubble size={30} />
        </button>

        {/* Connect button */}
        <button
          onClick={handleConnect}
          onMouseEnter={() => setHoverText(getHoverText())}
          onMouseLeave={() => setHoverText(null)}
          className="flex cursor-pointer items-center min-w-35 justify-center gap-1 px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-800 transition text-sm"
        >
          {status === "connect" && <IoPersonAdd />}
          {status === "accepted" && !hoverText && <IoPerson />}
          {status === "pending" && !hoverText && <IoPersonOutline />}
          {(status === "pending" || status === "accepted") && hoverText && <IoPersonRemove />}
          {status === "blocked" && !hoverText && <ImBlocked />}
          {status === "blocked" && hoverText && <IoPerson />}

          <span className="truncate">
            {hoverText ? hoverText : t(`connection.${status}`)}
          </span>
        </button>
      </div>
    </div>
  );
}

MatchCard.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default memo(MatchCard);