import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
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

const MessagesContext = createContext();
MessagesContext.displayName = "MessagesContext";

export const MessagesProvider = ({ children }) => {
  const insertMessage = useInsertMessageMutation().mutateAsync;
  const updateMessage = useUpdateMessageMutation().mutateAsync;
  const deleteMessage = useDeleteMessageMutation().mutateAsync;
  const markMessagesAsRead = useMarkMessagesAsReadMutation().mutateAsync;

  const value = {
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

MessagesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
};
