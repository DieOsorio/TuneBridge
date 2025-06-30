/* ------------------------------------------------------------------
 * Settings / UI preferences  ― key-factory
 * -----------------------------------------------------------------*/
export const UI_PREFERENCES_KEY = () => ["uiPreferences"];
export const UI_PREFERENCE_KEY = (profileId) => ["uiPreference", profileId];

export const uiPrefKeyFactory = ({ profileId } = {}) => ({
  all: UI_PREFERENCES_KEY(),
  single: profileId ? UI_PREFERENCE_KEY(profileId) : undefined,
});


/* ------------------------------------------------------------------
 * Settings / Privacy preferences ― key-factory
 * -----------------------------------------------------------------*/
export const PRIVACY_SETTINGS_KEY  = () => ["privacySettings"];
export const PRIVACY_SETTING_KEY   = (profileId) => ["privacySetting", profileId];

export const privacyKeyFactory = ({ profileId } = {}) => ({
  all   : PRIVACY_SETTINGS_KEY(),
  single: profileId ? PRIVACY_SETTING_KEY(profileId) : undefined,
});


/* ------------------------------------------------------------------
 * Notification preferences – key factory
 * -----------------------------------------------------------------*/
export const NOTIF_PREFS_KEY = () => ["notificationPrefs"];
export const NOTIF_PREF_KEY = (profileId) => [
  "notificationPref",
  profileId,
];

export const notifPrefKeyFactory = ({ profileId } = {}) => ({
  all: NOTIF_PREFS_KEY(),
  single: profileId ? NOTIF_PREF_KEY(profileId) : undefined,
});
