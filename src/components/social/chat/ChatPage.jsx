import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useChatUI } from "../../../context/social/chat/ChatUIContext";

const ChatPage = () => {
  const { isConversationListVisible, setIsConversationListVisible } = useChatUI();

  const handleSelectConversation = () => {
    setIsConversationListVisible(false);
  };

  return (
    <div className="flex h-screen relative">
      {/* Sidebar (Conversation List) */}
      <div
        className={`fixed md:static top-0 left-0 h-full bg-gray-900 z-50 transition-transform duration-300 ease-in-out
          ${isConversationListVisible ? "translate-x-0 w-3/5" : "-translate-x-full"} md:translate-x-0 md:w-1/4`}
      >
        {/* Quitamos botón de cierre, lo maneja ChatHeader */}
        <ConversationList onSelectConversation={handleSelectConversation} />
      </div>

      {/* Chat window */}
      <div className="flex-1 md:w-3/4 w-full h-full overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
