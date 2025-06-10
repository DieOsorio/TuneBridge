// --- ROLES KEY FACTORY ---
export const ROLES_KEY = (profileId) => ["roles", profileId];
export const ROLE_KEY = (roleId) => ["role", roleId];
export const roleKeyFactory = ({ profileId, roleId } = {}) => ({
  all: profileId ? ROLES_KEY(profileId) : undefined,
  single: roleId ? ROLE_KEY(roleId) : undefined,
});

// --- COMPOSER DETAILS KEY FACTORY ---
export const COMPOSER_DETAILS_LIST_KEY = (roleId) => ["composerDetailsList", roleId];
export const COMPOSER_DETAILS_KEY = (id) => ["composerDetails", id];
export const composerDetailsKeyFactory = ({ roleId, id } = {}) => ({
  all: roleId ? COMPOSER_DETAILS_LIST_KEY(roleId) : undefined,
  single: id ? COMPOSER_DETAILS_KEY(id) : undefined,
});

// --- PRODUCER DETAILS KEY FACTORY ---
export const PRODUCER_DETAILS_LIST_KEY = (roleId) => ["producerDetailsList", roleId];
export const PRODUCER_DETAILS_KEY = (id) => ["producerDetails", id];
export const producerDetailsKeyFactory = ({ roleId, id } = {}) => ({
  all: roleId ? PRODUCER_DETAILS_LIST_KEY(roleId) : undefined,
  single: id ? PRODUCER_DETAILS_KEY(id) : undefined,
});

// --- SINGER DETAILS KEY FACTORY ---
export const SINGER_DETAILS_LIST_KEY = (roleId) => ["singerDetailsList", roleId];
export const SINGER_DETAILS_KEY = (id) => ["singerDetails", id];
export const singerDetailsKeyFactory = ({ roleId, id } = {}) => ({
  all: roleId ? SINGER_DETAILS_LIST_KEY(roleId) : undefined,
  single: id ? SINGER_DETAILS_KEY(id) : undefined,
});

// --- DJ DETAILS KEY FACTORY ---
export const DJ_DETAILS_LIST_KEY = (roleId) => ["djDetailsList", roleId];
export const DJ_DETAILS_KEY = (id) => ["djDetails", id];
export const djDetailsKeyFactory = ({ roleId, id } = {}) => ({
  all: roleId ? DJ_DETAILS_LIST_KEY(roleId) : undefined,
  single: id ? DJ_DETAILS_KEY(id) : undefined,
});

// --- INSTRUMENT DETAILS KEY FACTORY ---
export const INSTRUMENT_DETAILS_LIST_KEY = (roleId) => ["instrumentDetailsList", roleId];
export const INSTRUMENT_DETAILS_KEY = (id) => ["instrumentDetails", id];
export const instrumentDetailsKeyFactory = ({ roleId, id } = {}) => ({
  all: roleId ? INSTRUMENT_DETAILS_LIST_KEY(roleId) : undefined,
  single: id ? INSTRUMENT_DETAILS_KEY(id) : undefined,
});

// --- MEDIA LINKS KEY FACTORY ---
export const USER_MEDIA_LINKS_KEY = (profileId) => ["userMediaLinks", profileId];
export const MEDIA_LINK_KEY = (id) => ["mediaLink", id];
export const mediaLinksKeyFactory = ({ profileId, id } = {}) => ({
  all: profileId ? USER_MEDIA_LINKS_KEY(profileId) : undefined,
  single: id ? MEDIA_LINK_KEY(id) : undefined,
});
