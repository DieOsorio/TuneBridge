// import { EventRsvpsProvider } from "./EventRsvpsContext";
// import { GroupEventsProvider } from "./GroupEventsContext";
import { ProfileGroupFollowsProvider } from "./ProfileGroupFollowsContext";

export const GroupsProvider = ({ children }) => {
  return (
    // <GroupEventsProvider>
    //   <EventRsvpsProvider>
    <ProfileGroupFollowsProvider>
      {children}
    </ProfileGroupFollowsProvider>
      /* </EventRsvpsProvider>
    </GroupEventsProvider> */
                    
  );
};