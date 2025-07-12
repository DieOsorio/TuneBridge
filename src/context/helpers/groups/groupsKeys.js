
// Group Events Keys
export const groupEventsKeyFactory = ({ profileGroupId }) => {
  return {
    root: ["groupEvents"],
    all: ["groupEvents", profileGroupId],
    byId: (eventId) => ["groupEvents", profileGroupId, eventId],
  };
};

// Group Event RSVPs Keys
export const groupEventRsvpsKeyFactory = ({ eventId }) => {
  return {
    root: ["groupEventRsvps"],
    all: ["groupEventRsvps", eventId],
    byId: (profileId) => ["groupEventRsvps", eventId, profileId],
  };
};

/* --- PROFILE‑GROUP FOLLOWS KEY FACTORY ----------------------- */
export const PROFILE_GROUP_FOLLOWS_KEY = (groupId)              => ["groupFollows", groupId];
export const PROFILE_GROUP_FOLLOW_KEY  = (groupId, profileId)   => ["groupFollow",  groupId, profileId];
export const PROFILE_GROUP_FOLLOWS_INFINITE_KEY = (groupId)     => ["groupFollowsInfinite", groupId];

export const profileGroupFollowsKeyFactory = ({
  profileGroupId,
  followerProfileId,
} = {}) => ({
  followers: profileGroupId ? PROFILE_GROUP_FOLLOWS_KEY(profileGroupId) : undefined,
  single: profileGroupId && followerProfileId
    ? PROFILE_GROUP_FOLLOW_KEY(profileGroupId, followerProfileId)
    : undefined,
  followersInfinite: profileGroupId
    ? PROFILE_GROUP_FOLLOWS_INFINITE_KEY(profileGroupId)
    : undefined,
});