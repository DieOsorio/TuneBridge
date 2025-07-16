import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchConnectionsQuery,
  useAddConnectionMutation,
  useUpdateConnectionMutation,
  useDeleteConnectionMutation,
  useConnectionBetweenProfiles,
} from "./userConnectionsActions";
import { UserConnection } from "./userConnectionsActions";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface UserConnectionsContextValue {
  connections: UserConnection[] | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  addConnection: (data: Partial<UserConnection>) => Promise<UserConnection>;
  updateConnection: (data: { connection: UserConnection; updatedConnection: Partial<UserConnection> }) => Promise<UserConnection>;
  deleteConnection: (data: UserConnection) => Promise<void>;
  userConnections: typeof useFetchConnectionsQuery;
  connectionBetweenProfiles: typeof useConnectionBetweenProfiles;
}

const UserConnectionsContext = createContext<UserConnectionsContextValue | undefined>(undefined);
UserConnectionsContext.displayName = "UserConnectionsContext";

export const UserConnectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // TODO: Replace with actual profileId from context or props
  const profileId = ""; // You should inject the real profileId here
  const { data: connections, isLoading: loading, error, refetch } = useFetchConnectionsQuery(profileId);
  const addConnection = useAddConnectionMutation().mutateAsync;
  const updateConnection = useUpdateConnectionMutation().mutateAsync;
  const deleteConnection = useDeleteConnectionMutation().mutateAsync;

  const value: UserConnectionsContextValue = {
    connections,
    loading,
    error,
    refetch,
    addConnection,
    updateConnection,
    deleteConnection,
    userConnections: useFetchConnectionsQuery,
    connectionBetweenProfiles: useConnectionBetweenProfiles,
  };

  return (
    <UserConnectionsContext.Provider value={value}>
      {children}
    </UserConnectionsContext.Provider>
  );
};

export const useUserConnections = (): UserConnectionsContextValue => {
  const context = useContext(UserConnectionsContext);
  if (!context) {
    throw new Error("useUserConnections must be used within a UserConnectionsProvider");
  }
  return context;
};
