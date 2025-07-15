import { GroupEventRsvpsProvider } from "./GroupEventRsvpsContext";
import { GroupEventsProvider } from "./GroupEventsContext";
import { ProfileGroupFollowsProvider } from "./ProfileGroupFollowsContext";

export const GroupsProvider = ({ children }) => {
  return (
    <GroupEventsProvider>
      <GroupEventRsvpsProvider>
        <ProfileGroupFollowsProvider>
          {children}
        </ProfileGroupFollowsProvider>
      </GroupEventRsvpsProvider>
    </GroupEventsProvider> 
                    
  );
};