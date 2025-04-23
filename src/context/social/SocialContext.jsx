import React from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";
import { PostsProvider } from "./PostsContext";
import { LikesProvider } from "./LikesContext";
import { CommentsProvider } from "./CommentsContext";
import { MessagesProvider } from "./MessagesContext";

export const SocialProvider = ({ children }) => {
  return (
    <UserConnectionsProvider>
      <PostsProvider>
        <CommentsProvider>
          <MessagesProvider>
            <LikesProvider>
              {children}
            </LikesProvider>
          </MessagesProvider>  
        </CommentsProvider>
      </PostsProvider>
    </UserConnectionsProvider>
  );
};