import { useAuth } from "../../../context/AuthContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";
import { useMessages } from "../../../context/social/chat/MessagesContext";

import ErrorMessage from "../../../utils/ErrorMessage";
import ConversationItemSkeleton from "./skeletons/ConversationItemSkeleton";

import { Conversation } from "../../../context/social/chat/conversationsActions";
import { Participant } from "../../../context/social/chat/participantsActions";

type Props = {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (conversationId: string) => void;
};

const ConversationItem = ({ conversation, isSelected, onClick }: Props) => {
  const { user } = useAuth();
  const { fetchParticipants } = useParticipants();

  const {
    data: participants = [],
    isLoading: isParticipantsLoading,
    error: errorParticipants,
  } = fetchParticipants(conversation.id);

  const { fetchProfile } = useProfile();

  const otherParticipant = participants?.find(
    (p: Participant) => p.profile_id !== user?.id
  );

  const {
    data: otherProfile,
    isLoading: loadingProfile,
    error: errorProfile,
  } = fetchProfile(otherParticipant?.profile_id ?? "");

  const { unreadMessages } = useMessages();

  const {
    data: unreadData,
    isLoading: loadingUnread,
  } = unreadMessages({
    conversationId: conversation.id,
    profileId: user?.id || "",
  });

  const loading = isParticipantsLoading || loadingProfile;

  if (loading)
    return <ConversationItemSkeleton isSelected={isSelected} />;

  if (errorParticipants || errorProfile)
    return (
      <ErrorMessage
        error={
          errorParticipants?.message || errorProfile?.message || "Unknown error"
        }
      />
    );

  const avatarUrl = conversation.is_group
    ? conversation.avatar_url
    : otherProfile?.avatar_url;

  const title = conversation.is_group
    ? conversation.title
    : otherProfile?.username;

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
        isSelected ? "bg-sky-700" : "hover:bg-sky-950 hover:text-white"
      }`}
    >
      <div className="relative">
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

        {!loadingUnread && unreadData?.length ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadData?.length ?? 0}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col">
        <span className={`font-medium truncate ${isSelected && "text-white"}`}>
          {title || "Untitled"}
        </span>
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
