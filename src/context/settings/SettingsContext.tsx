import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n from '../../i18n';
import {
  useUiPreferencesQuery,
  useUpsertUiPreferences,
  usePrivacySettingsQuery,
  useUpsertPrivacySettings,
  useNotificationPrefsQuery,
  useUpsertNotificationPrefs
} from "./settingsActions";
import { useAuth } from "../AuthContext";

export interface SettingsContextValue {
  prefs: { lang: string; theme: string };
  saveUiPreferences: (prefs: { lang: string; theme: string }) => Promise<void>;
  privacyPrefs: any;
  privacyOthers: typeof usePrivacySettingsQuery;
  savePrivacySettings: (prefs: any) => Promise<void>;
  notifPrefs: any;
  saveNotificationPrefs: (prefsObj: any) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);
SettingsContext.displayName = "SettingsContext";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const profileId = user?.id;

  /* ---------- UI SETTINGS ---------- */
  const [prefs, setPrefs] = useState<{ lang: string; theme: string }>(
    {
      lang: localStorage.getItem("lang") || "en",
      theme: localStorage.getItem("theme") || "dark",
    }
  );

  // React-Query hooks
  const { data: dbPrefs } = useUiPreferencesQuery(profileId ?? "__empty__");
  const upsertUiPreferences = useUpsertUiPreferences().mutateAsync;

  // Theme
  useEffect(() => {
    if (dbPrefs) setPrefs({ 
      lang: dbPrefs.lang, 
      theme: dbPrefs.theme 
    });
  }, [dbPrefs])

  useEffect(() => {
    // Theme
    if (prefs.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Lang
    i18n.changeLanguage(prefs.lang);

    localStorage.setItem("lang", prefs.lang);
    localStorage.setItem("theme", prefs.theme);
  }, [prefs])

  const saveUiPreferences = async ({ lang, theme }: { lang: string; theme: string }) => {
    if (!profileId) return; // guest
    await upsertUiPreferences({ profile_id: profileId, lang, theme });
    setPrefs({ lang, theme });
  };

  /* ---------- PRIVACY SETTINGS ---------- */
  const { data: privacyPrefs = {} } = usePrivacySettingsQuery(profileId ?? "__empty__");
  const upsertPrivacy = useUpsertPrivacySettings().mutateAsync;

  const savePrivacySettings = async (newPrefs: any) => {
    if (!profileId) return;
    await upsertPrivacy({ profile_id: profileId, prefs: newPrefs });
  }

  /* ---------- NOTIFICATION SETTINGS ---------- */
  const { data: notifPrefs = null } = useNotificationPrefsQuery(profileId ?? "__empty__");
  const upsertNotificationPrefs = useUpsertNotificationPrefs().mutateAsync;

  const saveNotificationPrefs = async (prefsObj: any) => {
    if (!profileId) return;
    await upsertNotificationPrefs({ profile_id: profileId, ...prefsObj });
  };

  const value: SettingsContextValue = {
    //ui settings
    prefs,
    saveUiPreferences,

    //privacy settings
    privacyPrefs,
    privacyOthers: usePrivacySettingsQuery,
    savePrivacySettings,

    //notification settings
    notifPrefs,
    saveNotificationPrefs
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextValue => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};
