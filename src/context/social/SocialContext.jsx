import React from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";
import { PostsProvider } from "./PostsContext";
import { LikesProvider } from "./LikesContext";
import { CommentsProvider } from "./CommentsContext";

export const SocialProvider = ({ children }) => {
  return (
    <UserConnectionsProvider>
      <PostsProvider>
        <CommentsProvider>
          <LikesProvider>
          {children}
          </LikesProvider>
        </CommentsProvider>
      </PostsProvider>
    </UserConnectionsProvider>
  );
};