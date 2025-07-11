import { createContext, useContext } from "react";
import PropTypes  from "prop-types";
import { useAuth } from "../AuthContext";

import {
  useFollowersOfGroupQuery,
  useFollowRowQuery,
  useFollowGroupMutation,
  useUnfollowGroupMutation,
} from "./profileGroupFollowsActions";

/* ------------------------------------------------------------------ */
const Ctx = createContext(null);
Ctx.displayName = "ProfileGroupFollowsContext";

/* ------------------------------------------------------------------ */
export const ProfileGroupFollowsProvider = ({ children }) => {
  const { user } = useAuth();
  const authId   = user?.id;

  const followGroup   = useFollowGroupMutation().mutateAsync;
  const unfollowGroup = useUnfollowGroupMutation().mutateAsync;

  const value = {
    /** list of follower IDs */
    followersOfGroup : useFollowersOfGroupQuery,
    /** -> row | null */
    checkFollowStatus: (groupId) => useFollowRowQuery(groupId, authId),
    followGroup,
    unfollowGroup,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

ProfileGroupFollowsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfileGroupFollows = () => {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useProfileGroupFollows must be used inside its provider");
  return ctx;
};
