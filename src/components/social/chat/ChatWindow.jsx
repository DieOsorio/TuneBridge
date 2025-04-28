import { useParams } from "react-router-dom";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useAuth } from "../../../context/AuthContext"
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import Loading from "../../../utils/Loading"
import ErrorMessage from "../../../utils/ErrorMessage"

const ChatWindow = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();

  const { fetchMessages } = useMessages();
  const { data: messages, isLoading, error } = fetchMessages(conversationId);
  
  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversationId={conversationId} />
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} profileId={user.id} />
      </div>
      <div className="p-4 border-t border-neutral-700">
        <MessageInput conversationId={conversationId} senderId={user.id} />
      </div>
    </div>
  );
};

export default ChatWindow;
