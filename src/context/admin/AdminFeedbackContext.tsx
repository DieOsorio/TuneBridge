import { createContext, useContext, ReactNode } from "react";
import {
  useUserFeedbacksQuery,
  useAdminAllFeedbacksQuery,
  useInsertUserFeedbackMutation,
  useUpdateUserFeedbackMutation,
  useDeleteUserFeedbackMutation,
} from "./adminFeedbackActions";

export interface AdminFeedbackContextValue {
  userFeedbacks: typeof useUserFeedbacksQuery;
  allFeedbacks: typeof useAdminAllFeedbacksQuery;
  insertUserFeedback: ReturnType<typeof useInsertUserFeedbackMutation>["mutateAsync"];
  updateUserFeedback: ReturnType<typeof useUpdateUserFeedbackMutation>["mutateAsync"];
  deleteUserFeedback: ReturnType<typeof useDeleteUserFeedbackMutation>["mutateAsync"];
}

const AdminFeedbackContext = createContext<AdminFeedbackContextValue | undefined>(undefined);
AdminFeedbackContext.displayName = "AdminFeedbackContext";

export interface AdminFeedbackProviderProps {
  children: ReactNode;
}

export const AdminFeedbackProvider = ({ children }: AdminFeedbackProviderProps) => {
  const insertUserFeedback = useInsertUserFeedbackMutation().mutateAsync;
  const updateUserFeedback = useUpdateUserFeedbackMutation().mutateAsync;
  const deleteUserFeedback = useDeleteUserFeedbackMutation().mutateAsync;

  const value: AdminFeedbackContextValue = {
    userFeedbacks: useUserFeedbacksQuery,
    allFeedbacks: useAdminAllFeedbacksQuery,
    insertUserFeedback,
    updateUserFeedback,
    deleteUserFeedback,
  };

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}
    </AdminFeedbackContext.Provider>
  );
};

export const useAdminFeedback = (): AdminFeedbackContextValue => {
  const context = useContext(AdminFeedbackContext);
  if (!context) {
    throw new Error("useAdminFeedback must be used within an AdminFeedbackProvider");
  }
  return context;
};
