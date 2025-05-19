import { useParams } from "react-router-dom";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useAuth } from "../../../context/AuthContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useEffect } from "react";

const ChatWindow = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();

  
  const { fetchMessages, markMessagesAsRead, unreadMessages, messagesRealtime } = useMessages();
  const { data: unreadMessagesData } = unreadMessages({ conversationId, profileId: user.id });
  const { data: messages, isLoading, error } = fetchMessages(conversationId);
  messagesRealtime(conversationId); 
  
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

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} profileId={user.id} />
      </div>
      <div className="p-4">
        <MessageInput conversationId={conversationId} senderId={user.id} />
      </div>
    </div>
  );
};

export default ChatWindow;
