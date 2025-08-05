import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserConnections } from "@/context/social/UserConnectionsContext";
import { useConversations } from "@/context/social/chat/ConversationsContext";
import { useAuth } from "@/context/AuthContext";
import { useParticipants } from "@/context/social/chat/ParticipantsContext";

import { 
  BoltIcon, 
  ChatBubbleOvalLeftIcon, 
  UserIcon, 
  UserPlusIcon,
  UserCircleIcon,
  UserMinusIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/solid";

import { handleStartChat } from "../social/chat/utilis/handleStartChat";
import ProfileAvatar from "./ProfileAvatar";
import { useCanSendDM } from "@/utils/useCanSendDM";
import MatchCardSkeleton from "./skeletons/MatchCardSkeleton";

export interface MatchCardProfile {
  profile_id: string;
  username: string;
  avatar_url?: string;
  name?: string;
  display_name?: string;
  match_score: number;
  [key: string]: any;
}

export interface MatchCardProps {
  profile: MatchCardProfile;
  loading?: boolean;
}

const MatchCard = memo(({ profile, loading: loadingProfile }: MatchCardProps) => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const {
    addConnection,
    deleteConnection,
    updateConnection,
    userConnections,
  } = useUserConnections();

  const { findConversation, createConversation } = useConversations();
  const { addParticipant } = useParticipants();

  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { canSend, loading: loadingCanSend } = useCanSendDM(profile.profile_id);

  const navigate = useNavigate();

  const { data: connections } = userConnections(profile.profile_id);
  const connection = connections?.find(
    (c: any) =>
      (user && c.follower_profile_id === user.id && c.following_profile_id === profile.profile_id) ||
      (user && c.follower_profile_id === profile.profile_id && c.following_profile_id === user.id)
  );

  const validStatuses = ["connect", "pending", "accepted", "blocked"] as const;
  type StatusType = typeof validStatuses[number];

  function isValidStatus(value: any): value is StatusType {
    return validStatuses.includes(value);
  }

  const rawStatus = connection?.status;
  const status: StatusType = isValidStatus(rawStatus) ? rawStatus : "connect";

  const handleConnect = async () => {
    if (!user) return;
    if (status === "connect") {
      await addConnection({
        follower_profile_id: user.id,
        following_profile_id: profile.profile_id,
        status: "pending",
      });
    } else if ((status === "pending" || status === "accepted") && connection) {
      await deleteConnection(connection);
    } else if (status === "blocked" && connection) {
      await updateConnection({
        connection,
        updatedConnection: { status: "accepted" },
      });
    }
  };

  const startChat = () => {
    if (isStartingChat || !user) return;
    handleStartChat({
      myProfileId: user.id,
      otherProfile: {
        id: profile.profile_id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        last_seen: profile.last_seen
      },
      findConversation,
      createConversation,
      addParticipant,
      navigate,
      setLoading: () => setIsStartingChat(true),
    });
  };

  const percentage = Math.round(profile.match_score * 100);

  const loading = loadingProfile || !profile || loadingCanSend;

  if (loading) return <MatchCardSkeleton />;

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

  const icon = {
    connect: <UserPlusIcon className="w-4 h-4" />,
    pending: <UserCircleIcon className="w-4 h-4" />,
    accepted: <UserIcon className="w-4 h-4" />,
    blocked: <NoSymbolIcon className="w-4 h-4" />,
  }[status];

  return (
    <div
      className="
      max-w-100 w-full mx-auto border border-gray-400 rounded-xl p-4 
      shadow-sm bg-gray-950 
      hover:shadow-md 
      transition-all duration-150 ease-in-out 
      will-change-transform
    "
    >
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/profile/${profile.profile_id}`}>
          <ProfileAvatar
            avatar_url={profile.avatar_url}
            alt={profile.username}
            className="!w-13 !h-13"
            loading={false}
            list={false}
            gender={profile.gender ?? ""}
            group={false}
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
        <BoltIcon className="text-amber-500 w-4 h-4" />
        <span>Match: {percentage}%</span>
      </div>

      <div className="flex flex-col items-end gap-2 text-sm">
        {/* Chat button */}
        {canSend && (
          <button
            onClick={startChat}
            className="absolute top-4 right-4 text-amber-700 cursor-pointer hover:text-amber-800 transition"
          >
            <ChatBubbleOvalLeftIcon className="w-8 h-8" />
          </button>
        )}

        {/* Connect button */}
        <button
          onClick={handleConnect}
          title={getHoverText() || ""}
          className="flex cursor-pointer items-center min-w-35 justify-center gap-1 px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-800 transition text-sm"
        >
          <span className="truncate flex items-center gap-1">
            {hoverText && status === "accepted" && <UserMinusIcon className="w-4 h-4" />}
            {hoverText && status === "pending" && <UserMinusIcon className="w-4 h-4" />}
            {hoverText && status === "blocked" && <UserIcon className="w-4 h-4" />}
            {!hoverText && icon}
            <span>{hoverText ? hoverText : t(`connection.${status}`)}</span>
          </span>
        </button>
      </div>
    </div>
  );
});

export default MatchCard;
