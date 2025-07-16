import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchConversationsQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useFindConversationWithUser,
  useFetchConversationQuery,
} from "./conversationsActions";
import { Conversation, FindConversationParams, UpdateConversationParams } from "./conversationsActions";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface ConversationsContextValue {
  fetchConversations: (profileId: string) => UseQueryResult<Conversation[], Error>;
  fetchConversation: (conversationId: string) => UseQueryResult<Conversation, Error>;
  findConversation: (params: FindConversationParams) => Promise<Conversation | null>;
  createConversation: (conversation: Partial<Conversation>) => Promise<Conversation>;
  updateConversation: (params: UpdateConversationParams) => Promise<Conversation>;
  deleteConversation: (conversation: Conversation) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | undefined>(undefined);
ConversationsContext.displayName = "ConversationsContext";

export const ConversationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const createConversation = useCreateConversationMutation().mutateAsync;
  const updateConversation = useUpdateConversationMutation().mutateAsync;
  const deleteConversation = useDeleteConversationMutation().mutateAsync;
  const findConversation = useFindConversationWithUser().mutateAsync;

  const value: ConversationsContextValue = {
    fetchConversations: useFetchConversationsQuery,
    fetchConversation: useFetchConversationQuery,
    findConversation,
    createConversation,
    updateConversation,
    deleteConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = (): ConversationsContextValue => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error("useConversations must be used within a ConversationsProvider");
  }
  return context;
};
