import { useAuth } from "../../../context/AuthContext";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";

const ConversationItem = ({ conversation, isSelected, onClick }) => {
  const { user } = useAuth();
  const { fetchParticipants } = useParticipants();
  const {data: participants, isLoading: isParticipantsLoading, error: errorParticipants} = fetchParticipants(conversation.id)

  const { fetchProfile } = useProfile();
  const otherParticipant = participants?.find((p) => p.profile_id !== user.id);
  const {data: otherProfile, isLoading: loadingProfile, error: errorProfile } = fetchProfile(otherParticipant?.profile_id)


  if (isParticipantsLoading || loadingProfile) return <Loading />;
  if (errorParticipants || errorProfile) return <ErrorMessage error={errorParticipants?.message || errorProfile?.message} />;

  const avatarUrl = 
  conversation.is_group 
    ? conversation.avatar_url 
    : otherProfile?.avatar_url;
  const title = 
  conversation.is_group 
    ? conversation.title 
    : otherProfile?.username;

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${isSelected ? "bg-neutral-700" : "hover:bg-neutral-800 hover:text-white"}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm">
          {title?.charAt(0).toUpperCase() || "?"}
        </div>
      )}

      <div className="flex flex-col">
        <span className={`font-medium truncate ${isSelected && "text-white"}`}>{title || "Untitled"}</span>
        {conversation.last_message && (
          <span className="text-sm text-neutral-400 truncate max-w-[180px]">
            {conversation.last_message}
          </span>
        )}
      </div>
    </div>
  );
};

export default ConversationItem;
