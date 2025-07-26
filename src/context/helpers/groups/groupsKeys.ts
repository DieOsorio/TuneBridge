// Types for key factories
export interface GroupEventsKeyParams {
  profileGroupId: string;
}
export interface GroupEventRsvpsKeyParams {
  eventId: string;
}
export interface ProfileGroupFollowsKeyParams {
  profileGroupId?: string;
  followerProfileId?: string;
}

// Group Events Keys
export const groupEventsKeyFactory = ({ profileGroupId }: GroupEventsKeyParams) => {
  return {
    root: ["groupEvents"],
    all: ["groupEvents", profileGroupId],
    byId: (eventId: string) => ["groupEvents", profileGroupId, eventId],
  };
};

// Group Event RSVPs Keys
export const groupEventRsvpsKeyFactory = ({ eventId }: GroupEventRsvpsKeyParams) => {
  return {
    root: ["groupEventRsvps"],
    all: ["groupEventRsvps", eventId],
    byId: (profileId: string) => ["groupEventRsvps", eventId, profileId],
  };
};

/* --- PROFILE‑GROUP FOLLOWS KEY FACTORY ----------------------- */
export const PROFILE_GROUP_FOLLOWS_KEY = (groupId: string)              => ["groupFollows", groupId];
export const PROFILE_GROUP_FOLLOW_KEY  = (groupId: string, profileId: string)   => ["groupFollow",  groupId, profileId];
export const PROFILE_GROUP_FOLLOWS_INFINITE_KEY = (groupId: string)     => ["groupFollowsInfinite", groupId];

export const profileGroupFollowsKeyFactory = ({
  profileGroupId,
  followerProfileId,
}: ProfileGroupFollowsKeyParams = {}) => ({
  followers: profileGroupId ? PROFILE_GROUP_FOLLOWS_KEY(profileGroupId) : undefined,
  single: profileGroupId && followerProfileId
    ? PROFILE_GROUP_FOLLOW_KEY(profileGroupId, followerProfileId)
    : undefined,
  followersInfinite: profileGroupId
    ? PROFILE_GROUP_FOLLOWS_INFINITE_KEY(profileGroupId)
    : undefined,
});
