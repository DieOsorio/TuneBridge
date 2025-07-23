// --- PROFILES KEY FACTORY ---

interface ProfileKeyFactoryParams {
  id?: string;
  username?: string;
  searchTerm?: string;
  profileIds?: string[];
  infinite?: boolean;
}

export const PROFILES_KEY = (): readonly ["allProfiles"] => ["allProfiles"];

export const PROFILE_LAST_SEEN_KEY = (id: string): readonly ["profileLastSeen", string] => ["profileLastSeen", id];

export const PROFILE_KEY = (idOrUsername: string): readonly ["profile", string] => ["profile", idOrUsername];

export const PROFILES_MAP_KEY = (profileIds: readonly string[]): [string, readonly string[]] => ["profilesMap", profileIds];

export const PROFILES_INFINITE_KEY = (): readonly ["profilesInfinite"] => ["profilesInfinite"];

export const SEARCH_PROFILES_KEY = (searchTerm: string): readonly ["searchProfiles", string] => [
  "searchProfiles",
  searchTerm,
];

// New version: returns undefined for invalid keys (caller must guard with `enabled`)
export const profileKeyFactory = ({
  id,
  username,
  searchTerm,
  profileIds,
  infinite,
}: ProfileKeyFactoryParams = {}) => ({
  all: PROFILES_KEY(),
  single: id
    ? PROFILE_KEY(id)
    : username
    ? PROFILE_KEY(username)
    : undefined,
  map: profileIds && profileIds.length > 0 ? PROFILES_MAP_KEY(profileIds) : undefined,
  infinite: infinite ? PROFILES_INFINITE_KEY() : undefined,
  search: searchTerm ? SEARCH_PROFILES_KEY(searchTerm) : undefined,
  lastSeen: id ? PROFILE_LAST_SEEN_KEY(id) : undefined,
});

// --- PROFILE GROUPS KEY FACTORY ---

interface ProfileGroupsKeyFactoryParams {
  id?: string;
}

export const PROFILE_GROUPS_KEY = (): readonly ["profileGroups"] => ["profileGroups"];

export const PROFILE_GROUP_KEY = (id: string): readonly ["profileGroups", string] => ["profileGroups", id];

export const profileGroupsKeyFactory = ({ id }: ProfileGroupsKeyFactoryParams = {}) => ({
  all: PROFILE_GROUPS_KEY(),
  single: id ? PROFILE_GROUP_KEY(id) : undefined,
});

// --- PROFILE GROUP MEMBERS KEY FACTORY ---

interface ProfileGroupMembersKeyFactoryParams {
  profileGroupId?: string;
  profile_group_id?: string;
}

export const PROFILE_GROUP_MEMBERS_KEY = (profileGroupId: string): readonly ["profileGroupMembers", string] => [
  "profileGroupMembers",
  profileGroupId,
];

export const profileGroupMembersKeyFactory = ({
  profileGroupId,
  profile_group_id,
}: ProfileGroupMembersKeyFactoryParams = {}) => {
  const id = profileGroupId || profile_group_id;
  return {
    all: id ? PROFILE_GROUP_MEMBERS_KEY(id) : undefined,
  };
};

// --- USER GROUPS KEY FACTORY ---

interface UserGroupsKeyFactoryParams {
  userId?: string;
}

export const USER_GROUPS_KEY = (userId: string): readonly ["userGroups", string] => ["userGroups", userId];

export const userGroupsKeyFactory = ({ userId }: UserGroupsKeyFactoryParams = {}) => ({
  all: userId ? USER_GROUPS_KEY(userId) : undefined,
});
