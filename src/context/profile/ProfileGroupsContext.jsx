import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchProfileGroupsQuery,
  useFetchProfileGroupQuery,
  useCreateProfileGroupMutation,
  useUpdateProfileGroupMutation,
  useDeleteProfileGroupMutation,
} from "./profileGroupsActions";

const ProfileGroupsContext = createContext();
ProfileGroupsContext.displayName = "ProfileGroupsContext";

export const ProfileGroupsProvider = ({ children }) => {
  const { data: profileGroups, isLoading: loading, error, refetch } = useFetchProfileGroupsQuery();
  const createProfileGroup = useCreateProfileGroupMutation().mutateAsync;
  const updateProfileGroup = useUpdateProfileGroupMutation().mutateAsync;
  const deleteProfileGroup = useDeleteProfileGroupMutation().mutateAsync;

  const value = {
    profileGroups,
    loading,
    error,
    refetch,
    fetchProfileGroup: useFetchProfileGroupQuery,
    createProfileGroup,
    updateProfileGroup,
    deleteProfileGroup,
  };

  return (
    <ProfileGroupsContext.Provider value={value}>
      {children}
    </ProfileGroupsContext.Provider>
  );
};

ProfileGroupsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfileGroups = () => {
  const context = useContext(ProfileGroupsContext);
  if (!context) {
    throw new Error("useProfileGroups must be used within a ProfileGroupsProvider");
  }
  return context;
};