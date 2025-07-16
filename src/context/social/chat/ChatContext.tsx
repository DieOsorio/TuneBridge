import React, { ReactNode } from "react";
import { ConversationsProvider } from "./ConversationsContext";
import { ParticipantsProvider } from "./ParticipantsContext";
import { MessagesProvider } from "./MessagesContext";
import { ChatUIProvider } from "./ChatUIContext";

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  return (
    <ChatUIProvider>
      <ConversationsProvider>
        <ParticipantsProvider>
          <MessagesProvider>
            {children}
          </MessagesProvider>
        </ParticipantsProvider>
      </ConversationsProvider>
    </ChatUIProvider>
  );
};
