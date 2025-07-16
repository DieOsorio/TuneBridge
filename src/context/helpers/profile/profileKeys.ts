// --- PROFILES KEY FACTORY ---

// Types for possible input parameters
interface ProfileKeyFactoryParams {
  id?: string;
  username?: string;
  searchTerm?: string;
  profileIds?: string[];
  infinite?: boolean;
}

// Key for all profiles (no parameters)
export const PROFILES_KEY = (): readonly ["allProfiles"] => ["allProfiles"];

// Key for last seen timestamp by profile ID
export const PROFILE_LAST_SEEN_KEY = (id: string): readonly ["profileLastSeen", string] => ["profileLastSeen", id];

// Key for a single profile by ID or username
export const PROFILE_KEY = (idOrUsername: string): readonly ["profile", string] => ["profile", idOrUsername];

// Key for mapping multiple profile IDs
export const PROFILES_MAP_KEY = (profileIds: readonly string[]): [string, readonly string[]] => ["profilesMap", profileIds];

// Key for infinite profiles list (no parameters)
export const PROFILES_INFINITE_KEY = (): readonly ["profilesInfinite"] => ["profilesInfinite"];

// Key for searching profiles by search term
export const SEARCH_PROFILES_KEY = (searchTerm: string): readonly ["searchProfiles", string] => ["searchProfiles", searchTerm];

// Factory function returning keys depending on provided input parameters
export const profileKeyFactory = ({
  id,
  username,
  searchTerm,
  profileIds,
  infinite,
}: ProfileKeyFactoryParams = {}) => ({
  all: PROFILES_KEY(),
  single: id ? PROFILE_KEY(id) : username ? PROFILE_KEY(username) : PROFILE_KEY("__empty__"),
  map: profileIds && profileIds.length > 0 ? PROFILES_MAP_KEY(profileIds) : PROFILES_MAP_KEY(["__empty__"]),
  infinite: infinite ? PROFILES_INFINITE_KEY() : PROFILES_INFINITE_KEY(),
  search: searchTerm ? SEARCH_PROFILES_KEY(searchTerm) : SEARCH_PROFILES_KEY("__empty__"),
  lastSeen: id ? PROFILE_LAST_SEEN_KEY(id) : PROFILE_LAST_SEEN_KEY("__empty__"),
});

// --- PROFILE GROUPS KEY FACTORY ---

interface ProfileGroupsKeyFactoryParams {
  id?: string;
}

// Key for all profile groups (no parameters)
export const PROFILE_GROUPS_KEY = (): readonly ["profileGroups"] => ["profileGroups"];

// Key for a single profile group by ID
export const PROFILE_GROUP_KEY = (id: string): readonly ["profileGroups", string] => ["profileGroups", id];

// Factory function returning keys for profile groups based on optional ID
export const profileGroupsKeyFactory = ({ id }: ProfileGroupsKeyFactoryParams = {}) => ({
  all: PROFILE_GROUPS_KEY(),
  single: id ? PROFILE_GROUP_KEY(id) : PROFILE_GROUP_KEY("__empty__"),
});

// --- PROFILE GROUP MEMBERS KEY FACTORY ---

interface ProfileGroupMembersKeyFactoryParams {
  profileGroupId?: string;
  profile_group_id?: string; // alternate naming allowed
}

// Key for profile group members by profile group ID
export const PROFILE_GROUP_MEMBERS_KEY = (profileGroupId: string): readonly ["profileGroupMembers", string] => [
  "profileGroupMembers",
  profileGroupId,
];

// Factory function returning keys for profile group members based on optional group ID
export const profileGroupMembersKeyFactory = ({
  profileGroupId,
  profile_group_id,
}: ProfileGroupMembersKeyFactoryParams = {}) => {
  const id = profileGroupId || profile_group_id || "__empty__";
  return {
    all: PROFILE_GROUP_MEMBERS_KEY(id),
  };
};

// --- USER GROUPS KEY FACTORY ---

interface UserGroupsKeyFactoryParams {
  userId?: string;
}

// Key for user groups by user ID
export const USER_GROUPS_KEY = (userId: string): readonly ["userGroups", string] => ["userGroups", userId];

// Factory function returning keys for user groups based on optional user ID
export const userGroupsKeyFactory = ({ userId }: UserGroupsKeyFactoryParams = {}) => ({
  all: userId ? USER_GROUPS_KEY(userId) : USER_GROUPS_KEY("__empty__"),
});
