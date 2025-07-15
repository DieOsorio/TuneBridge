import { createContext, useContext } from "react";
import PropTypes from "prop-types";

import {
  useFetchEventRsvpsQuery,
  useFetchUserRsvpQuery,
  useUpsertRsvpMutation,
} from "./GroupEventRsvpsActions";

const GroupEventRsvpsContext = createContext();
GroupEventRsvpsContext.displayName = "GroupEventRsvpsContext";

export const GroupEventRsvpsProvider = ({ children }) => {
  const upsertRsvp = useUpsertRsvpMutation().mutateAsync;

  const value = {
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

GroupEventRsvpsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGroupEventRsvps = () => {
  const context = useContext(GroupEventRsvpsContext);
  if (!context) {
    throw new Error("useGroupEventRsvps must be used within a GroupEventRsvpsProvider");
  }
  return context;
};
