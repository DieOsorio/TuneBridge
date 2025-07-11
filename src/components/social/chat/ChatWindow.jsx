import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useAuth } from "../../../context/AuthContext";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();

  const { fetchMessages, markMessagesAsRead, unreadMessages, messagesRealtime } = useMessages();
  // Only fetch and pass data if conversationId is valid
  const shouldFetch = !!conversationId;
  const { data: messages } = fetchMessages(shouldFetch ? conversationId : undefined);
  messagesRealtime(shouldFetch ? conversationId : undefined);
  const { data: unreadMessagesData } = unreadMessages({ conversationId: shouldFetch ? conversationId : undefined, profileId: user.id });

  useEffect(() => {
    if (
      unreadMessagesData &&
      unreadMessagesData.length > 0 &&
      markMessagesAsRead &&
      user.id
    ) {
      const messageIds = unreadMessagesData.map((msg) => msg.id);
      markMessagesAsRead({ messageIds, profileId: user.id });
    }
  }, [unreadMessagesData, markMessagesAsRead, user.id]);

  // Always pass a valid array to MessageList
  const safeMessages = Array.isArray(messages) ? messages.filter(m => m && m.sender_profile_id) : [];

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={shouldFetch ? conversationId : undefined} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={shouldFetch ? safeMessages : []} profileId={user.id} />
      </div>
      <div className="p-4">
        {conversationId && (
          <MessageInput conversationId={shouldFetch ? conversationId : undefined} senderId={user.id} />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
