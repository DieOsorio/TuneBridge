import { createContext, useContext, ReactNode } from "react";
import {
  useUserReportsQuery,
  useAdminAllReportsQuery,
  useInsertUserReportMutation,
  useUpdateUserReportMutation,
  useDeleteUserReportMutation,
} from "./adminReportsActions";

export interface AdminReportsContextValue {
  userReports: typeof useUserReportsQuery;
  allReports: typeof useAdminAllReportsQuery;
  insertUserReport: ReturnType<typeof useInsertUserReportMutation>["mutateAsync"];
  updateUserReport: ReturnType<typeof useUpdateUserReportMutation>["mutateAsync"];
  deleteUserReport: ReturnType<typeof useDeleteUserReportMutation>["mutateAsync"];
}

const AdminReportsContext = createContext<AdminReportsContextValue | undefined>(undefined);
AdminReportsContext.displayName = "AdminReportsContext";

export interface AdminReportsProviderProps {
  children: ReactNode;
}

export const AdminReportsProvider = ({ children }: AdminReportsProviderProps) => {
  const insertUserReport = useInsertUserReportMutation().mutateAsync;
  const updateUserReport = useUpdateUserReportMutation().mutateAsync;
  const deleteUserReport = useDeleteUserReportMutation().mutateAsync;

  const value: AdminReportsContextValue = {
    userReports: useUserReportsQuery,
    allReports: useAdminAllReportsQuery,
    insertUserReport,
    updateUserReport,
    deleteUserReport,
  };

  return <AdminReportsContext.Provider value={value}>{children}</AdminReportsContext.Provider>;
};

export const useAdminReports = (): AdminReportsContextValue => {
  const context = useContext(AdminReportsContext);
  if (!context) {
    throw new Error("useAdminReports must be used within an AdminReportsProvider");
  }
  return context;
};
