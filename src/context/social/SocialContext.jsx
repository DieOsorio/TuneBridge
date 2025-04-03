import React from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";

export const SocialProvider = ({ children }) => {
  return (
    <UserConnectionsProvider>
      {children}
    </UserConnectionsProvider>
  );
};