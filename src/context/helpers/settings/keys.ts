/* ------------------------------------------------------------------
 * Settings / UI preferences  ― key-factory
 * -----------------------------------------------------------------*/
export type UiPrefKeyFactoryParams = {
  profileId?: string;
};
export const UI_PREFERENCES_KEY = (): ["uiPreferences"] => ["uiPreferences"];
export const UI_PREFERENCE_KEY = (profileId: string): ["uiPreference", string] => ["uiPreference", profileId];

export const uiPrefKeyFactory = ({ profileId }: UiPrefKeyFactoryParams = {}): {
  all: ["uiPreferences"];
  single?: ["uiPreference", string];
} => ({
  all: UI_PREFERENCES_KEY(),
  single: profileId ? UI_PREFERENCE_KEY(profileId) : undefined,
});


/* ------------------------------------------------------------------
 * Settings / Privacy preferences ― key-factory
 * -----------------------------------------------------------------*/
export type PrivacyKeyFactoryParams = {
  profileId?: string;
};
export const PRIVACY_SETTINGS_KEY  = (): ["privacySettings"] => ["privacySettings"];
export const PRIVACY_SETTING_KEY   = (profileId: string): ["privacySetting", string] => ["privacySetting", profileId];

export const privacyKeyFactory = ({ profileId }: PrivacyKeyFactoryParams = {}): {
  all: ["privacySettings"];
  single?: ["privacySetting", string];
} => ({
  all: PRIVACY_SETTINGS_KEY(),
  single: profileId ? PRIVACY_SETTING_KEY(profileId) : undefined,
});


/* ------------------------------------------------------------------
 * Notification preferences – key factory
 * -----------------------------------------------------------------*/
export type NotifPrefKeyFactoryParams = {
  profileId?: string;
};
export const NOTIF_PREFS_KEY = (): ["notificationPrefs"] => ["notificationPrefs"];
export const NOTIF_PREF_KEY = (profileId: string): ["notificationPref", string] => ["notificationPref", profileId];

export const notifPrefKeyFactory = ({ profileId }: NotifPrefKeyFactoryParams = {}): {
  all: ["notificationPrefs"];
  single?: ["notificationPref", string];
} => ({
  all: NOTIF_PREFS_KEY(),
  single: profileId ? NOTIF_PREF_KEY(profileId) : undefined,
});
