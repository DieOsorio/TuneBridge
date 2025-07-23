import { createContext, useContext, ReactNode } from "react";
import {
  useFetchRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
} from "./rolesActions";

interface RolesContextValue {
  fetchRoles: typeof useFetchRolesQuery;
  addRole: ReturnType<typeof useAddRoleMutation>["mutateAsync"];
  deleteRole: ReturnType<typeof useDeleteRoleMutation>["mutateAsync"];
}

const RolesContext = createContext<RolesContextValue | undefined>(undefined);
RolesContext.displayName = "RolesContext";

export const RolesProvider = ({ children }: { children: ReactNode }) => {
  const addRole = useAddRoleMutation().mutateAsync;
  const deleteRole = useDeleteRoleMutation().mutateAsync;

  const value: RolesContextValue = {
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
