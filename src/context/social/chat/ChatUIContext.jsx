import { createContext, useContext, useState } from 'react';

const ChatUIContext = createContext();

export function ChatUIProvider({ children }) {
  const [isConversationListVisible, setIsConversationListVisible] = useState(false);

  const toggleConversationList = () => {
    setIsConversationListVisible((prev) => !prev);
  };

  return (
    <ChatUIContext.Provider value={{ isConversationListVisible, toggleConversationList, setIsConversationListVisible }}>
      {children}
    </ChatUIContext.Provider>
  );
}

export function useChatUI() {
  return useContext(ChatUIContext);
}
