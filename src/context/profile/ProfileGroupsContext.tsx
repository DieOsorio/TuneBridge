import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchProfileGroupsQuery,
  useFetchProfileGroupQuery,
  useCreateProfileGroupMutation,
  useUpdateProfileGroupMutation,
  useDeleteProfileGroupMutation,
} from "./profileGroupsActions";
import { UseQueryResult } from "@tanstack/react-query";
import { ProfileGroup } from "./profileGroupsActions";

export interface ProfileGroupsContextType {
  profileGroups: ProfileGroup[] | undefined;
  loading: boolean;
  error: Error | null;roles_in_group?: string[];
  refetch: () => void;
  fetchProfileGroup: (id: string) => UseQueryResult<ProfileGroup, Error>;
  createProfileGroup: (group: Partial<ProfileGroup>) => Promise<ProfileGroup>;
  updateProfileGroup: (args: { id: string; updatedGroup: Partial<ProfileGroup> }) => Promise<ProfileGroup>;
  deleteProfileGroup: (id: string) => Promise<void>;
}

const ProfileGroupsContext = createContext<ProfileGroupsContextType | undefined>(undefined);
ProfileGroupsContext.displayName = "ProfileGroupsContext";

interface ProfileGroupsProviderProps {
  children: ReactNode;
}

export const ProfileGroupsProvider: React.FC<ProfileGroupsProviderProps> = ({ children }) => {
  const { data: profileGroups, isLoading: loading, error, refetch } = useFetchProfileGroupsQuery();
  const createProfileGroup = useCreateProfileGroupMutation().mutateAsync;
  const updateProfileGroup = useUpdateProfileGroupMutation().mutateAsync;
  const deleteProfileGroup = useDeleteProfileGroupMutation().mutateAsync;

  const value: ProfileGroupsContextType = {
    profileGroups,
    loading,
    error: error ?? null,
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

export const useProfileGroups = (): ProfileGroupsContextType => {
  const context = useContext(ProfileGroupsContext);
  if (!context) {
    throw new Error("useProfileGroups must be used within a ProfileGroupsProvider");
  }
  return context;
};