import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useAuth } from "../../../context/AuthContext";

import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();

  const shouldFetch = !!conversationId && !!user?.id;

  const {
    fetchMessages,
    markMessagesAsRead,
    unreadMessages,
    messagesRealtime,
  } = useMessages();

  messagesRealtime(conversationId ?? "");

  const { data: messages = [] } = fetchMessages(conversationId ?? "");

  const { data: unreadMessagesData = [] } = unreadMessages({
    conversationId: conversationId ?? "",
    profileId: user?.id ?? "",
  });

  useEffect(() => {
    if (
      shouldFetch &&
      unreadMessagesData &&
      unreadMessagesData.length > 0 &&
      markMessagesAsRead
    ) {
      const messageIds = unreadMessagesData.map((msg) => msg.id);
      markMessagesAsRead({ 
        messageIds, 
        profileId: user.id, 
        conversationId 
      });
    }
  }, [shouldFetch, unreadMessagesData, markMessagesAsRead, user?.id, conversationId]);

  const safeMessages = Array.isArray(messages)
    ? messages.filter((m) => m && m.sender_profile_id)
    : [];

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={shouldFetch ? safeMessages : []}
          profileId={user?.id ?? ""}
        />
      </div>
      <div className="p-4">
        {conversationId && user?.id && (
          <MessageInput
            conversationId={conversationId}
            senderId={user.id}
          />
        )}
      </div>
    </div>
  );
};

export default ChatWindow;