// --- PROFILES KEY FACTORY ---
export const PROFILES_KEY = () => ["allProfiles"];
export const PROFILE_KEY = (idOrUsername) => ["profile", idOrUsername];
export const PROFILES_MAP_KEY = (profileIds) => ["profilesMap", profileIds];
export const PROFILES_INFINITE_KEY = () => ["profilesInfinite"];
export const SEARCH_PROFILES_KEY = (searchTerm) => ["searchProfiles", searchTerm];
export const profileKeyFactory = ({ id, username, searchTerm, profileIds, infinite } = {}) => ({
  all: PROFILES_KEY(),
  single: id ? PROFILE_KEY(id) : username ? PROFILE_KEY(username) : undefined,
  map: profileIds ? PROFILES_MAP_KEY(profileIds) : undefined,
  infinite: infinite ? PROFILES_INFINITE_KEY() : undefined,
  search: searchTerm ? SEARCH_PROFILES_KEY(searchTerm) : undefined,
});

// --- PROFILE GROUPS KEY FACTORY ---
export const PROFILE_GROUPS_KEY = () => ["profileGroups"];
export const PROFILE_GROUP_KEY = (id) => ["profileGroups", id];
export const profileGroupsKeyFactory = ({ id } = {}) => ({
  all: PROFILE_GROUPS_KEY(),
  single: id ? PROFILE_GROUP_KEY(id) : undefined,
});

// --- PROFILE GROUP MEMBERS KEY FACTORY ---
export const PROFILE_GROUP_MEMBERS_KEY = (profileGroupId) => ["profileGroupMembers", profileGroupId];
export const profileGroupMembersKeyFactory = ({ profileGroupId, profile_group_id } = {}) => {
  const id = profileGroupId || profile_group_id;
  return {
    all: id ? PROFILE_GROUP_MEMBERS_KEY(id) : undefined,
  };
};


// --- USER GROUPS KEY FACTORY ---
export const USER_GROUPS_KEY = (userId) => ["userGroups", userId];
export const userGroupsKeyFactory = ({ userId } = {}) => ({
  all: userId ? USER_GROUPS_KEY(userId) : undefined,
});
