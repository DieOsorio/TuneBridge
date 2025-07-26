import { createContext, useContext, ReactNode } from "react";
import {
  useMessagesRealtime,
  useFetchMessagesQuery,
  useInsertMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
  useTotalUnreadMessages,
  useUnreadMessages,
  useMarkMessagesAsReadMutation,
} from "./messagesActions";
import { Message, UnreadMessagesResult, UnreadMessagesParams, MarkMessagesAsReadParams, UpdateMessageParams, DeleteMessageParams } from "./messagesActions";
import { UseQueryResult } from "@tanstack/react-query";

interface MessagesContextValue {
  messagesRealtime: (conversation_id: string) => void;
  fetchMessages: (conversationId: string) => UseQueryResult<Message[], Error>;
  insertMessage: (message: Partial<Message>) => Promise<Message>;
  updateMessage: (params: UpdateMessageParams) => Promise<Message>;
  deleteMessage: (params: DeleteMessageParams) => Promise<void>;
  totalUnreadMessages: (profileId: string) => UseQueryResult<UnreadMessagesResult, Error>;
  unreadMessages: (params: UnreadMessagesParams) => UseQueryResult<Message[], Error>;
  markMessagesAsRead: (params: MarkMessagesAsReadParams) => Promise<any>;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);
MessagesContext.displayName = "MessagesContext";

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const insertMessage = useInsertMessageMutation().mutateAsync;
  const updateMessage = useUpdateMessageMutation().mutateAsync;
  const deleteMessage = useDeleteMessageMutation().mutateAsync;
  const markMessagesAsRead = useMarkMessagesAsReadMutation().mutateAsync;

  const value: MessagesContextValue = {
    messagesRealtime: useMessagesRealtime,
    fetchMessages: useFetchMessagesQuery,
    insertMessage,
    updateMessage,
    deleteMessage,
    totalUnreadMessages: useTotalUnreadMessages,
    unreadMessages: useUnreadMessages,
    markMessagesAsRead,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessages = (): MessagesContextValue => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
