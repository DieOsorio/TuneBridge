import { ConversationsProvider } from "./ConversationsContext";
import { ParticipantsProvider } from "./ParticipantsContext";
import { MessagesProvider } from "./MessagesContext";

export const ChatProvider = ({ children }) => {
  return (
    <ConversationsProvider>
      <ParticipantsProvider>
        <MessagesProvider>
          {children}
        </MessagesProvider>
      </ParticipantsProvider>
    </ConversationsProvider>
  );
};