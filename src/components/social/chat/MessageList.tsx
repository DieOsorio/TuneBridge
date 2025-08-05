import { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import { Message } from "@/context/social/chat/messagesActions";

type MessageListProps = {
  messages: Message[] | null | undefined;
  profileId: string;
};

const MessageList = ({ messages, profileId }: MessageListProps) => {
  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll immediately to bottom on mount or when messages update
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight; // instant scroll
    }
  }, [safeMessages.length]);

  return (
    <div
      ref={containerRef}
      className="space-y-4 overflow-y-auto h-full px-2"
    >
      {safeMessages.map((message) => {
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
