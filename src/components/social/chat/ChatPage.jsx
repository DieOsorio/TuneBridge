import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

const ChatPage = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r border-neutral-700">
        <ConversationList />
      </div>
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
