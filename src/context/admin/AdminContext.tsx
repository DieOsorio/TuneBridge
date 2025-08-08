import { ReactNode } from "react";
import { AdminFeedbackProvider } from "./AdminFeedbackContext";
import { AdminLogsProvider } from "./AdminLogsContext"; 
import { AdminReportsProvider } from "./AdminReportsContext"; 
import { AdminRolesProvider } from "./AdminRolesContext"; 
import { BannedUsersProvider } from "./BannedUsersContext"; 

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  return (
    <AdminFeedbackProvider>
      <AdminLogsProvider>
        <AdminReportsProvider>
          <AdminRolesProvider>
            <BannedUsersProvider>
              {children}
            </BannedUsersProvider>
          </AdminRolesProvider>
        </AdminReportsProvider>
      </AdminLogsProvider>
    </AdminFeedbackProvider>
  );
};