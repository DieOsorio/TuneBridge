import React from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";
import { PostsProvider } from "./PostsContext";
import { LikesProvider } from "./LikesContext";
import { CommentsProvider } from "./CommentsContext";
import { ChatProvider } from "./chat/ChatContext";

export const SocialProvider = ({ children }) => {
  return (
    <UserConnectionsProvider>
      <PostsProvider>
        <CommentsProvider>
          <ChatProvider>
            <LikesProvider>
              {children}
            </LikesProvider>
          </ChatProvider>  
        </CommentsProvider>
      </PostsProvider>
    </UserConnectionsProvider>
  );
};