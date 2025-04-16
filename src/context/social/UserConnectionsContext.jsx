import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  useFetchConnectionsQuery,
  addConnectionMutation,
  updateConnectionMutation,
  deleteConnectionMutation,
} from "./userConnectionsActions";

const UserConnectionsContext = createContext();
UserConnectionsContext.displayName = "UserConnectionsContext";

export const UserConnectionsProvider = ({ children }) => {
  const { data, isLoading, error, refetch } = useFetchConnectionsQuery();
  const addConnection = addConnectionMutation();
  const updateConnection = updateConnectionMutation();
  const deleteConnection = deleteConnectionMutation();

  const value = {
    connections: data,
    loading: isLoading,
    error,
    refetch,
    addConnection: addConnection.mutateAsync,
    updateConnection: updateConnection.mutateAsync,
    deleteConnection: deleteConnection.mutateAsync,    
  }

  return (
    <UserConnectionsContext.Provider
      value={value}
    >
      {children}
    </UserConnectionsContext.Provider>
  );
};

UserConnectionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUserConnections = () => {
  const context = useContext(UserConnectionsContext);
  if (!context) {
    throw new Error("useUserConnections must be used within a UserConnectionsProvider");
  }
  return context;
};