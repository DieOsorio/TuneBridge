import React from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";
import { PostsProvider } from "./PostsContext";

export const SocialProvider = ({ children }) => {
  return (
    <UserConnectionsProvider>
      <PostsProvider>
        {children}
      </PostsProvider>
    </UserConnectionsProvider>
  );
};