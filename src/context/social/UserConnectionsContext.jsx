import { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  useFetchConnectionsQuery,
  useAddConnectionMutation,
  useUpdateConnectionMutation,
  useDeleteConnectionMutation,
  useConnectionBetweenProfiles,
} from "./userConnectionsActions";

const UserConnectionsContext = createContext();
UserConnectionsContext.displayName = "UserConnectionsContext";

export const UserConnectionsProvider = ({ children }) => {
  const { data: connections, isLoading: loading, error, refetch } = useFetchConnectionsQuery();
  const addConnection = useAddConnectionMutation().mutateAsync;
  const updateConnection = useUpdateConnectionMutation().mutateAsync;
  const deleteConnection = useDeleteConnectionMutation().mutateAsync;

  const value = {
    connections,
    loading,
    error,
    refetch,
    addConnection,
    updateConnection,
    deleteConnection,
    userConnections: useFetchConnectionsQuery,
    connectionBetweenProfiles: useConnectionBetweenProfiles,    
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