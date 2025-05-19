import { ConversationsProvider } from "./ConversationsContext";
import { ParticipantsProvider } from "./ParticipantsContext";
import { MessagesProvider } from "./MessagesContext";
import { ChatUIProvider } from "./ChatUIContext";

export const ChatProvider = ({ children }) => {
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