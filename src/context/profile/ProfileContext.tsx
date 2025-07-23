import { createContext, useContext, ReactNode } from "react";
import { UseMutationResult } from "@tanstack/react-query";

import {
  useGetProfileMatchScore,
  useProfileQuery,
  useAllProfilesQuery,
  useGetProfilesMatch,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
  useProfilesMap,
  useSearchProfilesQuery,
  useInfiniteProfilesQuery,
  useLastSeen,
} from "./profileActions";

// Define the shape of a Profile object based on the database schema
import type { Profile } from "./profileActions";

// Define the context value shape for strong typing
interface ProfileContextType {
  allProfiles: Profile[] | undefined; // All profiles loaded from the server, can be undefined while loading
  loading: boolean;                   // Loading state for the profiles query
  error: unknown;                    // Error can be any thrown error
  refetch: () => void;               // Function to manually refetch all profiles

  // Hooks exposed for finer control / queries
  fetchProfile: typeof useProfileQuery;
  profilesMap: typeof useProfilesMap;

  // Mutations exposed as async functions
  createProfile: UseMutationResult<void, unknown, { userId: string; email: string }>["mutateAsync"];
  updateProfile: UseMutationResult<Profile, unknown, Profile>["mutateAsync"];
  deleteProfile: UseMutationResult<void, unknown, string>["mutateAsync"];

  matchScore: UseMutationResult<number, unknown, { profileAId: string; profileBId: string }>["mutateAsync"];
  matchAll: UseMutationResult<any[], unknown, { profileId: string; limit: number }>["mutateAsync"];
  lastSeen: UseMutationResult<void, unknown, void>["mutateAsync"];

  searchProfiles: typeof useSearchProfilesQuery;
  infiniteProfiles: typeof useInfiniteProfilesQuery;
}

// Create the React context with an initial null value
const ProfileContext = createContext<ProfileContextType | null>(null);
ProfileContext.displayName = "ProfileContext";


// ProfileProvider component that fetches initial data and provides all actions
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  // Use the custom hooks to get data and mutations
  const { data: allProfiles, isLoading: loading, error, refetch } = useAllProfilesQuery();

  const createProfile = useCreateProfile().mutateAsync;
  const updateProfile = useUpdateProfile().mutateAsync;
  const deleteProfile = useDeleteProfile().mutateAsync;
  const matchScore = useGetProfileMatchScore().mutateAsync;
  const matchAll = useGetProfilesMatch().mutateAsync;
  const lastSeen = useLastSeen().mutateAsync;

  // Bundle all values into a single object for context consumers
  const value: ProfileContextType = {
    allProfiles,
    loading,
    error,
    refetch,
    fetchProfile: useProfileQuery,
    profilesMap: useProfilesMap,
    createProfile,
    updateProfile,
    deleteProfile,
    matchScore,
    matchAll,
    lastSeen,
    searchProfiles: useSearchProfilesQuery,
    infiniteProfiles: useInfiniteProfilesQuery,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

// Hook to use the ProfileContext with proper error if used outside provider
export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
