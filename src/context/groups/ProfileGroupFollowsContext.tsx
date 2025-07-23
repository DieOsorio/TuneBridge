import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../AuthContext";
import {
  useFollowersOfGroupQuery,
  useFollowRowQuery,
  useFollowGroupMutation,
  useUnfollowGroupMutation,
  useCountFollowers,
  useGroupFollowersInfiniteQuery,
} from "./profileGroupFollowsActions";

interface ProfileGroupFollowsContextValue {
  followersOfGroup: typeof useFollowersOfGroupQuery;
  checkFollowStatus: typeof useFollowRowQuery;
  followGroup: ReturnType<typeof useFollowGroupMutation>["mutateAsync"];
  unfollowGroup: ReturnType<typeof useUnfollowGroupMutation>["mutateAsync"];
  countFollowers: typeof useCountFollowers;
  followersInfiniteQuery: typeof useGroupFollowersInfiniteQuery;
}

const ProfileGroupFollowsContext = createContext<ProfileGroupFollowsContextValue | undefined>(undefined);
ProfileGroupFollowsContext.displayName = "ProfileGroupFollowsContext";

export const ProfileGroupFollowsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const authId = user?.id;

  const followGroup = useFollowGroupMutation().mutateAsync;
  const unfollowGroup = useUnfollowGroupMutation().mutateAsync;

  const value: ProfileGroupFollowsContextValue = {
    followersOfGroup: useFollowersOfGroupQuery,
    checkFollowStatus: useFollowRowQuery,
    followGroup,
    unfollowGroup,
    countFollowers: useCountFollowers,
    followersInfiniteQuery: useGroupFollowersInfiniteQuery,
  };

  return <ProfileGroupFollowsContext.Provider value={value}>{children}</ProfileGroupFollowsContext.Provider>;
};

export const useProfileGroupFollows = (): ProfileGroupFollowsContextValue => {
  const ctx = useContext(ProfileGroupFollowsContext);
  if (!ctx) throw new Error("useProfileGroupFollows must be used inside its provider");
  return ctx;
};
