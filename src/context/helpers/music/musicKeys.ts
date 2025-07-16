// --- Types for key factories ---
export interface RoleKeyParams {
  profileId?: string;
  roleId?: string;
}
export interface DetailsKeyParams {
  roleId?: string;
  id?: string;
}
export interface MediaLinksKeyParams {
  profileId?: string;
  id?: string;
}

// --- ROLES KEY FACTORY ---
export const ROLES_KEY = (profileId: string | undefined): [string, string] => ["roles", profileId ?? ""];
export const ROLE_KEY = (roleId: string | undefined): [string, string] => ["role", roleId ?? ""];
export const roleKeyFactory = (entity: Partial<{ profile_id?: string; id?: string; role?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.profile_id ? ROLES_KEY(entity.profile_id) : undefined,
  single: entity.id ? ROLE_KEY(entity.id) : undefined,
});

// --- COMPOSER DETAILS KEY FACTORY ---
export const COMPOSER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["composerDetailsList", roleId ?? ""];
export const COMPOSER_DETAILS_KEY = (id: string | undefined): [string, string] => ["composerDetails", id ?? ""];
export const composerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.role_id ? COMPOSER_DETAILS_LIST_KEY(entity.role_id) : undefined,
  single: entity.id ? COMPOSER_DETAILS_KEY(entity.id) : undefined,
});

// --- PRODUCER DETAILS KEY FACTORY ---
export const PRODUCER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["producerDetailsList", roleId ?? ""];
export const PRODUCER_DETAILS_KEY = (id: string | undefined): [string, string] => ["producerDetails", id ?? ""];
export const producerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.role_id ? PRODUCER_DETAILS_LIST_KEY(entity.role_id) : undefined,
  single: entity.id ? PRODUCER_DETAILS_KEY(entity.id) : undefined,
});

// --- SINGER DETAILS KEY FACTORY ---
export const SINGER_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["singerDetailsList", roleId ?? ""];
export const SINGER_DETAILS_KEY = (id: string | undefined): [string, string] => ["singerDetails", id ?? ""];
export const singerDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.role_id ? SINGER_DETAILS_LIST_KEY(entity.role_id) : undefined,
  single: entity.id ? SINGER_DETAILS_KEY(entity.id) : undefined,
});

// --- DJ DETAILS KEY FACTORY ---
export const DJ_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["djDetailsList", roleId ?? ""];
export const DJ_DETAILS_KEY = (id: string | undefined): [string, string] => ["djDetails", id ?? ""];
export const djDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.role_id ? DJ_DETAILS_LIST_KEY(entity.role_id) : undefined,
  single: entity.id ? DJ_DETAILS_KEY(entity.id) : undefined,
});

// --- INSTRUMENT DETAILS KEY FACTORY ---
export const INSTRUMENT_DETAILS_LIST_KEY = (roleId: string | undefined): [string, string] => ["instrumentDetailsList", roleId ?? ""];
export const INSTRUMENT_DETAILS_KEY = (id: string | undefined): [string, string] => ["instrumentDetails", id ?? ""];
export const instrumentDetailsKeyFactory = (entity: Partial<{ role_id?: string; id?: string }> = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: entity.role_id ? INSTRUMENT_DETAILS_LIST_KEY(entity.role_id) : undefined,
  single: entity.id ? INSTRUMENT_DETAILS_KEY(entity.id) : undefined,
});

// --- MEDIA LINKS KEY FACTORY ---
export const USER_MEDIA_LINKS_KEY = (profileId: string | undefined): [string, string] => ["userMediaLinks", profileId ?? ""];
export const MEDIA_LINK_KEY = (id: string | undefined): [string, string] => ["mediaLink", id ?? ""];
export const mediaLinksKeyFactory = ({ profileId, id }: MediaLinksKeyParams = {}): { all?: [string, string]; single?: [string, string] } => ({
  all: profileId ? USER_MEDIA_LINKS_KEY(profileId) : undefined,
  single: id ? MEDIA_LINK_KEY(id) : undefined,
});
