import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  Role
} from "./rolesActions";

interface RolesContextValue {
  roles: Role[];
  loading: boolean;
  error: unknown;
  refetchRoles: () => void;
  fetchRoles: typeof useFetchRolesQuery;
  addRole: ReturnType<typeof useAddRoleMutation>["mutateAsync"];
  deleteRole: ReturnType<typeof useDeleteRoleMutation>["mutateAsync"];
}

const RolesContext = createContext<RolesContextValue | undefined>(undefined);
RolesContext.displayName = "RolesContext";

export const RolesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // NOTE: You must pass a profileId to useFetchRolesQuery, so this context should be refactored to accept it as a prop or from a parent context
  // For now, we'll use an empty string as a placeholder
  const { data, isLoading, error, refetch } = useFetchRolesQuery("");
  const addRole = useAddRoleMutation().mutateAsync;
  const deleteRole = useDeleteRoleMutation().mutateAsync;

  const value: RolesContextValue = {
    roles: data || [],
    loading: isLoading,
    error,
    refetchRoles: refetch,
    fetchRoles: useFetchRolesQuery,
    addRole,
    deleteRole,
  };

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>;
};

export const useRoles = (): RolesContextValue => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return context;
};
