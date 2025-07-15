import { createContext, useContext } from "react";
import PropTypes from "prop-types";

import {
  useFetchGroupEventsQuery,
  useFetchGroupEventQuery,
  useCreateGroupEventMutation,
  useUpdateGroupEventMutation,
  useDeleteGroupEventMutation,
} from "./groupEventsActions";

const GroupEventsContext = createContext();
GroupEventsContext.displayName = "GroupEventsContext";

export const GroupEventsProvider = ({ children }) => {
  const createEvent = useCreateGroupEventMutation().mutateAsync;
  const updateEvent = useUpdateGroupEventMutation().mutateAsync;
  const deleteEvent = useDeleteGroupEventMutation().mutateAsync;

  const value = {
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

GroupEventsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGroupEvents = () => {
  const context = useContext(GroupEventsContext);
  if (!context) {
    throw new Error("useGroupEvents must be used within a GroupEventsProvider");
  }
  return context;
};
