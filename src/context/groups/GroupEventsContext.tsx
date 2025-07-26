import { createContext, useContext, ReactNode } from "react";
import {
  useFetchGroupEventsQuery,
  useFetchGroupEventQuery,
  useCreateGroupEventMutation,
  useUpdateGroupEventMutation,
  useDeleteGroupEventMutation,
} from "./groupEventsActions";

interface GroupEventsContextValue {
  fetchGroupEvents: typeof useFetchGroupEventsQuery;
  fetchGroupEvent: typeof useFetchGroupEventQuery;
  createEvent: ReturnType<typeof useCreateGroupEventMutation>["mutateAsync"];
  updateEvent: ReturnType<typeof useUpdateGroupEventMutation>["mutateAsync"];
  deleteEvent: ReturnType<typeof useDeleteGroupEventMutation>["mutateAsync"];
}

const GroupEventsContext = createContext<GroupEventsContextValue | undefined>(undefined);
GroupEventsContext.displayName = "GroupEventsContext";

export const GroupEventsProvider = ({ children }: { children: ReactNode }) => {
  const createEvent = useCreateGroupEventMutation().mutateAsync;
  const updateEvent = useUpdateGroupEventMutation().mutateAsync;
  const deleteEvent = useDeleteGroupEventMutation().mutateAsync;

  const value: GroupEventsContextValue = {
    fetchGroupEvents: useFetchGroupEventsQuery,
    fetchGroupEvent: useFetchGroupEventQuery,
    createEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <GroupEventsContext.Provider value={value}>
      {children}
    </GroupEventsContext.Provider>
  );
};

export const useGroupEvents = (): GroupEventsContextValue => {
  const context = useContext(GroupEventsContext);
  if (!context) {
    throw new Error("useGroupEvents must be used within a GroupEventsProvider");
  }
  return context;
};
