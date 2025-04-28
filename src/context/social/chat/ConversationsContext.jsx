import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchConversationsQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
  useFindConversationWithUser,
  useFetchConversationQuery,
} from "./conversationsActions";

const ConversationsContext = createContext();
ConversationsContext.displayName = "ConversationsContext";

export const ConversationsProvider = ({ children }) => {
  const createConversation = useCreateConversationMutation().mutateAsync;
  const updateConversation = useUpdateConversationMutation().mutateAsync;
  const deleteConversation = useDeleteConversationMutation().mutateAsync;
  const findConversation = useFindConversationWithUser().mutateAsync;

  const value = {
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

ConversationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error("useConversations must be used within a ConversationsProvider");
  }
  return context;
};
