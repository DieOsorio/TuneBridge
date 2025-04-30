import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useUserNotificationsQuery,
  useInsertNotificationMutation,
  useUpdateNotificationMutation,
  useNotificationsRealtime,
} from "./notificationsActions";

const NotificationsContext = createContext();
NotificationsContext.displayName = "NotificationsContext";

export const NotificationsProvider = ({children}) => {
  const insertNotification = useInsertNotificationMutation().mutateAsync;
  const updateNotification = useUpdateNotificationMutation().mutateAsync;

  const value = {
    userNotifications: useUserNotificationsQuery,
    notificationsRealtime: useNotificationsRealtime,
    insertNotification,
    updateNotification,
  };

  return(
    <NotificationsContext.Provider
    value={value}>
      {children}
    </NotificationsContext.Provider>  
  )
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context;
};