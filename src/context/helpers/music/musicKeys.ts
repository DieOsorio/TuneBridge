// --- ROLES KEY FACTORY ---
export const ROLES_KEY = (profileId: string | undefined): [string, string] => ["roles", profileId ?? ""];
export const ROLE_KEY = (roleId: string | undefined): [string, string] => ["role", roleId ?? ""];
export const roleKeyFactory = (entity: Partial<{ profile_id?: string; id?: string; role?: string }> = {}) => ({
  all: ROLES_KEY(entity.profile_id),
  single: ROLE_KEY(entity.id),
});

// --- COMPOSER DETAILS KEY FACTORY ---
export const COMPOSER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["composerDetailsList", roleId ?? ""];
export const COMPOSER_DETAILS_KEY = (id: string | undefined): [string, string] => ["composerDetails", id ?? ""];
export const composerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}) => ({
  all: COMPOSER_DETAILS_LIST_KEY(entity.role_id),
  single: COMPOSER_DETAILS_KEY(entity.id),
});

// --- PRODUCER DETAILS KEY FACTORY ---
export const PRODUCER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["producerDetailsList", roleId ?? ""];
export const PRODUCER_DETAILS_KEY = (id: string | undefined): [string, string] => ["producerDetails", id ?? ""];
export const producerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}) => ({
  all: PRODUCER_DETAILS_LIST_KEY(entity.role_id),
  single: PRODUCER_DETAILS_KEY(entity.id),
});

// --- SINGER DETAILS KEY FACTORY ---
export const SINGER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["singerDetailsList", roleId ?? ""];
export const SINGER_DETAILS_KEY = (id: string | undefined): [string, string] => ["singerDetails", id ?? ""];
export const singerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}) => ({
  all: SINGER_DETAILS_LIST_KEY(entity.role_id),
  single: SINGER_DETAILS_KEY(entity.id),
});

// --- DJ DETAILS KEY FACTORY ---
export const DJ_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["djDetailsList", roleId ?? ""];
export const DJ_DETAILS_KEY = (id: string | undefined): [string, string] => ["djDetails", id ?? ""];
export const djDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}) => ({
  all: DJ_DETAILS_LIST_KEY(entity.role_id),
  single: DJ_DETAILS_KEY(entity.id),
});

// --- INSTRUMENT DETAILS KEY FACTORY ---
export const INSTRUMENT_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["instrumentDetailsList", roleId ?? ""];
export const INSTRUMENT_DETAILS_KEY = (id: string | undefined): [string, string] => ["instrumentDetails", id ?? ""];
export const instrumentDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}) => ({
  all: INSTRUMENT_DETAILS_LIST_KEY(entity.role_id),
  single: INSTRUMENT_DETAILS_KEY(entity.id),
});

// --- MEDIA LINKS KEY FACTORY ---
export const USER_MEDIA_LINKS_KEY = (profileId: string | undefined): [string, string] => ["userMediaLinks", profileId ?? ""];
export const MEDIA_LINK_KEY = (id: string | undefined): [string, string] => ["mediaLink", id ?? ""];
export const mediaLinksKeyFactory = (entity: Partial<{ profileId?: string; id?: string }> = {}) => ({
  all: USER_MEDIA_LINKS_KEY(entity.profileId),
  single: MEDIA_LINK_KEY(entity.id),
});
