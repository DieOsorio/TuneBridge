import { createContext, useContext, ReactNode } from "react";
import { 
  useAdminRolesQuery, 
  useUpsertAdminRoleMutation, 
  useDeleteAdminRoleMutation,
  useAllAdminRolesQuery, 
} from "./adminRolesActions";

export interface AdminRolesContextValue {
  adminRolesQuery: typeof useAdminRolesQuery;
  allAdminRolesQuery: typeof useAllAdminRolesQuery;
  upsertAdminRole: ReturnType<typeof useUpsertAdminRoleMutation>["mutateAsync"];
  deleteAdminRole: ReturnType<typeof useDeleteAdminRoleMutation>["mutateAsync"];
}

const AdminRolesContext = createContext<AdminRolesContextValue | undefined>(undefined);
AdminRolesContext.displayName = "AdminRolesContext";

export interface AdminRolesProviderProps {
  children: ReactNode;
}

export const AdminRolesProvider = ({ children }: AdminRolesProviderProps) => {
  const upsertAdminRole = useUpsertAdminRoleMutation().mutateAsync;
  const deleteAdminRole = useDeleteAdminRoleMutation().mutateAsync;

  const value: AdminRolesContextValue = {
    adminRolesQuery: useAdminRolesQuery,
    allAdminRolesQuery: useAllAdminRolesQuery,
    upsertAdminRole,
    deleteAdminRole,
  };

  return <AdminRolesContext.Provider value={value}>{children}</AdminRolesContext.Provider>;
};

export const useAdminRoles = (): AdminRolesContextValue => {
  const context = useContext(AdminRolesContext);
  if (!context) {
    throw new Error("useAdminRoles must be used within a AdminRolesProvider");
  }
  return context;
};
