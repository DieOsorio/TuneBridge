import { createContext, useContext, ReactNode } from "react";
import {
  useFetchEventRsvpsQuery,
  useFetchUserRsvpQuery,
  useUpsertRsvpMutation,
} from "./GroupEventRsvpsActions";

interface GroupEventRsvpsContextValue {
  fetchEventRsvps: typeof useFetchEventRsvpsQuery;
  fetchUserRsvp: typeof useFetchUserRsvpQuery;
  upsertRsvp: ReturnType<typeof useUpsertRsvpMutation>["mutateAsync"];
}

const GroupEventRsvpsContext = createContext<GroupEventRsvpsContextValue | undefined>(undefined);
GroupEventRsvpsContext.displayName = "GroupEventRsvpsContext";

export const GroupEventRsvpsProvider = ({ children }: { children: ReactNode }) => {
  const upsertRsvp = useUpsertRsvpMutation().mutateAsync;

  const value: GroupEventRsvpsContextValue = {
    fetchEventRsvps: useFetchEventRsvpsQuery,
    fetchUserRsvp: useFetchUserRsvpQuery,
    upsertRsvp,
  };

  return (
    <GroupEventRsvpsContext.Provider value={value}>
      {children}
    </GroupEventRsvpsContext.Provider>
  );
};

export const useGroupEventRsvps = () => {
  const context = useContext(GroupEventRsvpsContext);
  if (!context) {
    throw new Error("useGroupEventRsvps must be used within a GroupEventRsvpsProvider");
  }
  return context;
};
