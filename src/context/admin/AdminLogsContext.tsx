import { createContext, useContext, ReactNode } from "react";
import {
  useAdminLogsQuery,
  useAllAdminLogsQuery,
  useInsertAdminLogMutation,
} from "./adminLogsActions";

export interface AdminLogsContextValue {
  adminLogs: typeof useAdminLogsQuery;
  allAdminLogs: typeof useAllAdminLogsQuery;
  insertAdminLog: ReturnType<typeof useInsertAdminLogMutation>["mutateAsync"];
}

const AdminLogsContext = createContext<AdminLogsContextValue | undefined>(undefined);
AdminLogsContext.displayName = "AdminLogsContext";

export interface AdminLogsProviderProps {
  children: ReactNode;
}

export const AdminLogsProvider = ({ children }: AdminLogsProviderProps) => {
  const insertAdminLog = useInsertAdminLogMutation().mutateAsync;

  const value: AdminLogsContextValue = {
    adminLogs: useAdminLogsQuery,
    allAdminLogs: useAllAdminLogsQuery,
    insertAdminLog,
  };

  return (
    <AdminLogsContext.Provider value={value}>
      {children}
    </AdminLogsContext.Provider>
  );
};

export const useAdminLogs = (): AdminLogsContextValue => {
  const context = useContext(AdminLogsContext);
  if (!context) {
    throw new Error("useAdminLogs must be used within a AdminLogsProvider");
  }
  return context;
};
