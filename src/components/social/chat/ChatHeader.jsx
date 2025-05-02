import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { useParams, Link } from "react-router-dom";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useAuth } from "../../../context/AuthContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";

const ChatHeader = ({ conversationId }) => {
  const { fetchConversation } = useConversations();
  const { data: conversation, isLoading, error } = fetchConversation(conversationId);
  const { user } = useAuth();
  const { fetchParticipants } = useParticipants();
  const {data: participants, isLoading: isParticipantsLoading} = fetchParticipants(conversationId)

  const { fetchProfile } = useProfile();
  const otherParticipant = participants?.find((p) => p.profile_id !== user.id);
  const {data: otherProfile } = fetchProfile(otherParticipant?.profile_id)

  // If there isn't conversationId, render a generic message
  if (!conversationId) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 border-b border-sky-600">
        <h2 className="text-lg font-semibold">Select a conversation</h2>
      </div>
    );
  }

  if (isLoading || isParticipantsLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  const isGroup = conversation?.is_group;

  const avatarUrl = isGroup
    ? conversation?.avatar_url
    : otherProfile?.avatar_url;

  const title = isGroup
    ? conversation?.title
    : otherProfile?.username;

  return (
    <div className="flex items-center bg-gradient-to-l from-gray-900 gap-4 px-4 py-2 border-b-2 border-sky-600">
      {conversation?.avatar_url ? (
        <Link to={isGroup ? "" : `/profile/${otherProfile?.id}`}>
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
      ) : (
        <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm">
          {title?.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <h2 className="text-lg font-semibold">{title || "Untitled"}</h2>
    </div>
  );
};

export default ChatHeader;
