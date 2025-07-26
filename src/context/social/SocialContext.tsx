import React, { ReactNode } from "react";
import { UserConnectionsProvider } from "./UserConnectionsContext";
import { PostsProvider } from "./PostsContext";
import { LikesProvider } from "./LikesContext";
import { CommentsProvider } from "./CommentsContext";
import { NotificationsProvider } from "./NotificationsContext";
import { ChatProvider } from "./chat/ChatContext";
import { HashtagsProvider } from "./HashtagsContext";
import { PostHashtagsProvider } from "./PostHashtagsContext";
import { ProfileHashtagsProvider } from "./ProfileHashtagsContext";
import { AdsProvider } from "./adsContext";

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  return (
    <UserConnectionsProvider>
      <HashtagsProvider>
        <PostHashtagsProvider>
          <ProfileHashtagsProvider>
            <PostsProvider>
              <CommentsProvider>
                <ChatProvider>
                  <LikesProvider>
                    <NotificationsProvider>
                      <AdsProvider>
                        {children}
                      </AdsProvider>
                    </NotificationsProvider>
                  </LikesProvider>
                </ChatProvider>  
              </CommentsProvider>
            </PostsProvider>
          </ProfileHashtagsProvider>
        </PostHashtagsProvider>
      </HashtagsProvider>
    </UserConnectionsProvider>
  );
};
