import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface ChatUIContextValue {
  isConversationListVisible: boolean;
  toggleConversationList: () => void;
  setIsConversationListVisible: Dispatch<SetStateAction<boolean>>;
}

const ChatUIContext = createContext<ChatUIContextValue | undefined>(undefined);

export const ChatUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConversationListVisible, setIsConversationListVisible] = useState<boolean>(false);

  const toggleConversationList = () => {
    setIsConversationListVisible((prev) => !prev);
  };

  return (
    <ChatUIContext.Provider value={{ isConversationListVisible, toggleConversationList, setIsConversationListVisible }}>
      {children}
    </ChatUIContext.Provider>
  );
};

export function useChatUI(): ChatUIContextValue {
  const context = useContext(ChatUIContext);
  if (!context) {
    throw new Error('useChatUI must be used within a ChatUIProvider');
  }
  return context;
}
