import MessageItem from "./MessageItem";
import { Message } from "../../../context/social/chat/messagesActions";

type MessageListProps = {
  messages: Message[] | null | undefined;
  profileId: string;
};

const MessageList = ({ messages, profileId }: MessageListProps) => {
  // Defensive: filter out falsy/undefined/null messages and ensure array
  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];

  return (
    <div className="space-y-4">
      {safeMessages.length > 0 &&
        safeMessages.map((message) => {
          const isMine = message.sender_profile_id === profileId;
          return (
            <MessageItem
              key={message.id || message.tempId || Math.random()}
              message={message}
              isMine={isMine}
            />
          );
        })}
    </div>
  );
};

export default MessageList;
