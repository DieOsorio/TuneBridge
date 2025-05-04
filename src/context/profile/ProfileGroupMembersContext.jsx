import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchGroupMembersQuery,
  useFetchUserGroupsQuery,
  useAddGroupMemberMutation,
  useRemoveGroupMemberMutation,
} from "./profileGroupMembersActions";

const ProfileGroupMembersContext = createContext();
ProfileGroupMembersContext.displayName = "ProfileGroupMembersContext";

export const ProfileGroupMembersProvider = ({ children }) => {
  const addGroupMember = useAddGroupMemberMutation().mutateAsync;
  const removeGroupMember = useRemoveGroupMemberMutation().mutateAsync;

  const value = {
    fetchUserGroups: useFetchUserGroupsQuery,
    fetchGroupMembers: useFetchGroupMembersQuery,
    addGroupMember,
    removeGroupMember,
  };

  return (
    <ProfileGroupMembersContext.Provider value={value}>
      {children}
    </ProfileGroupMembersContext.Provider>
  );
};

ProfileGroupMembersProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfileGroupMembers = () => {
  const context = useContext(ProfileGroupMembersContext);
  if (!context) {
    throw new Error(
      "useProfileGroupMembers must be used within a ProfileGroupMembersProvider"
    );
  }
  return context;
};