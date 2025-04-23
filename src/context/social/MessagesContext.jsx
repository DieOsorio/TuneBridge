import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchMessagesQuery,
  useInsertMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} from "./messagesActions";

const MessagesContext = createContext();
MessagesContext.displayName = "MessagesContext";

export const MessagesProvider = ({ children }) => {
  const { data: allMessages, isLoading, error, refetch } = useFetchMessagesQuery();

  const insertMessage = useInsertMessageMutation().mutateAsync;
  const updateMessage = useUpdateMessageMutation().mutateAsync;
  const deleteMessage = useDeleteMessageMutation().mutateAsync;

  return (
    <MessagesContext.Provider value={{
      allMessages,
      messagesLoading: isLoading,
      messagesError: error,
      refetchMessages: refetch,

      insertMessage,
      updateMessage,
      deleteMessage,
    }}>
      {children}
    </MessagesContext.Provider>
  );
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
