// --- ADMIN ROLES KEY FACTORY ---
export type AdminRolesKeyFactoryParams = { profileId?: string };

export const ADMIN_ROLES_KEY = (profileId: string): ["adminRoles", string] => ["adminRoles", profileId];

export const adminRolesKeyFactory = ({ profileId }: AdminRolesKeyFactoryParams = {}): {
  all?: ["adminRoles", string];
  single?: ["adminRole", string];
} => ({
  all: profileId ? ADMIN_ROLES_KEY(profileId) : undefined,
  single: profileId ? ["adminRole", profileId] : undefined,
});


// --- ADMIN REPORTS KEY FACTORY ---
export type AdminReportsKeyFactoryParams = {
  profileId?: string;
  id?: string;
};

export const USER_REPORTS_KEY = (profileId: string): ["userReports", string] => ["userReports", profileId];
export const USER_REPORT_KEY = (id: string): ["userReport", string] => ["userReport", id];
export const ALL_USER_REPORTS_KEY: ["userReports", "all"] = ["userReports", "all"];

export const adminReportsKeyFactory = ({ profileId, id }: AdminReportsKeyFactoryParams = {}) => ({
  all: profileId ? USER_REPORTS_KEY(profileId) : ALL_USER_REPORTS_KEY,
  single: id ? USER_REPORT_KEY(id) : undefined,
});


// --- ADMIN FEEDBACK KEY FACTORY ---
export type AdminFeedbackKeyFactoryParams = { profileId?: string; id?: string };

export const USER_FEEDBACKS_KEY = (profileId: string): ["userFeedbacks", string] => ["userFeedbacks", profileId];
export const USER_FEEDBACK_KEY = (id: string): ["userFeedback", string] => ["userFeedback", id];

export const ALL_USER_FEEDBACKS_KEY = (): ["allUserFeedbacks"] => ["allUserFeedbacks"];

export const adminFeedbackKeyFactory = ({ profileId, id }: AdminFeedbackKeyFactoryParams = {}): {
  all?: ["userFeedbacks", string] | ["allUserFeedbacks"];
  single?: ["userFeedback", string];
} => ({
  all: profileId ? USER_FEEDBACKS_KEY(profileId) : ALL_USER_FEEDBACKS_KEY(),
  single: id ? USER_FEEDBACK_KEY(id) : undefined,
});


// --- BANNED USERS KEY FACTORY ---
export type BannedUsersKeyFactoryParams = { profileId?: string };

export const BANNED_USERS_ALL_KEY = ["bannedUsers"] as const;
export const BANNED_USER_KEY = (profileId: string): ["bannedUser", string] => ["bannedUser", profileId];

export const bannedUsersKeyFactory = ({ profileId }: BannedUsersKeyFactoryParams = {}) => ({
  all: profileId ? BANNED_USER_KEY(profileId) : BANNED_USERS_ALL_KEY,
  single: profileId ? BANNED_USER_KEY(profileId) : undefined,
});

// --- ADMIN LOGS KEY FACTORY ---
export type AdminLogsKeyFactoryParams = {
  profileId?: string; // admin who performed the action
  id?: string;
};

export const ADMIN_LOGS_ALL_KEY = ["adminLogs"] as const;
export const ADMIN_LOGS_KEY = (profileId: string): ["adminLogs", string] => ["adminLogs", profileId];
export const ADMIN_LOG_KEY = (id: string): ["adminLog", string] => ["adminLog", id];

export const adminLogsKeyFactory = ({ profileId, id }: AdminLogsKeyFactoryParams = {}) => ({
  all: profileId ? ADMIN_LOGS_KEY(profileId) : ADMIN_LOGS_ALL_KEY,
  single: id ? ADMIN_LOG_KEY(id) : undefined,
});
