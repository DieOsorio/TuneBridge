import { ReactNode } from "react";
import { GroupEventsProvider } from "./GroupEventsContext";
import { GroupEventRsvpsProvider } from "./GroupEventRsvpsContext";
import { ProfileGroupFollowsProvider } from "./ProfileGroupFollowsContext";
import { ProfileGroupsProvider } from "../profile/ProfileGroupsContext";
import { ProfileGroupMembersProvider } from "../profile/ProfileGroupMembersContext";

interface GroupsProviderProps {
  children: ReactNode;
}

export const GroupsProvider = ({ children }: GroupsProviderProps) => {
  return (
    <GroupEventsProvider>
      <GroupEventRsvpsProvider>
        <ProfileGroupFollowsProvider>
          <ProfileGroupsProvider>
            <ProfileGroupMembersProvider>
              {children}
            </ProfileGroupMembersProvider>
          </ProfileGroupsProvider>
        </ProfileGroupFollowsProvider>
      </GroupEventRsvpsProvider>
    </GroupEventsProvider>
  );
};
