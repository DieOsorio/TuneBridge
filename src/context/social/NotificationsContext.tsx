import { createContext, useContext, ReactNode } from "react";
import {
  useUserNotificationsQuery,
  useInsertNotificationMutation,
  useUpdateNotificationMutation,
  useNotificationsRealtime,
} from "./notificationsActions";

export interface NotificationsContextValue {
  userNotifications: typeof useUserNotificationsQuery;
  notificationsRealtime: typeof useNotificationsRealtime;
  insertNotification: ReturnType<typeof useInsertNotificationMutation>["mutateAsync"];
  updateNotification: ReturnType<typeof useUpdateNotificationMutation>["mutateAsync"];
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
NotificationsContext.displayName = "NotificationsContext";

export interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const insertNotification = useInsertNotificationMutation().mutateAsync;
  const updateNotification = useUpdateNotificationMutation().mutateAsync;

  const value: NotificationsContextValue = {
    userNotifications: useUserNotificationsQuery,
    notificationsRealtime: useNotificationsRealtime,
    insertNotification,
    updateNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
