import React, { ReactNode } from "react";
import { ConversationsProvider } from "./ConversationsContext";
import { ParticipantsProvider } from "./ParticipantsContext";
import { MessagesProvider } from "./MessagesContext";
import { ChatUIProvider } from "./ChatUIContext";
import { MessageAttachmentsProvider } from "./MessageAttachmentsContext";

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  return (
    <ChatUIProvider>
      <ConversationsProvider>
        <ParticipantsProvider>
          <MessagesProvider>
            <MessageAttachmentsProvider>
              {children}
            </MessageAttachmentsProvider>
          </MessagesProvider>
        </ParticipantsProvider>
      </ConversationsProvider>
    </ChatUIProvider>
  );
};
