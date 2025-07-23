import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n from "../../i18n";
import {
  useUiPreferencesQuery,
  useUpsertUiPreferences,
  usePrivacySettingsQuery,
  useUpsertPrivacySettings,
  useNotificationPrefsQuery,
  useUpsertNotificationPrefs,
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
  const [prefs, setPrefs] = useState<{ lang: string; theme: string }>({
    lang: localStorage.getItem("lang") || "en",
    theme: localStorage.getItem("theme") || "dark",
  });

  const { data: dbPrefs } = useUiPreferencesQuery(profileId);
  const upsertUiPreferences = useUpsertUiPreferences().mutateAsync;

  useEffect(() => {
    if (dbPrefs) {
      setPrefs({
        lang: dbPrefs.lang,
        theme: dbPrefs.theme,
      });
    }
  }, [dbPrefs]);

  useEffect(() => {
    if (prefs.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    i18n.changeLanguage(prefs.lang);
    localStorage.setItem("lang", prefs.lang);
    localStorage.setItem("theme", prefs.theme);
  }, [prefs]);

  const saveUiPreferences = async ({ lang, theme }: { lang: string; theme: string }) => {
    if (!profileId) return;
    await upsertUiPreferences({ profile_id: profileId, lang, theme });
    setPrefs({ lang, theme });
  };

  /* ---------- PRIVACY SETTINGS ---------- */
  const { data: privacyPrefs = {} } = usePrivacySettingsQuery(profileId);
  const upsertPrivacy = useUpsertPrivacySettings().mutateAsync;

  const savePrivacySettings = async (newPrefs: any) => {
    if (!profileId) return;
    await upsertPrivacy({ profile_id: profileId, prefs: newPrefs });
  };

  /* ---------- NOTIFICATION SETTINGS ---------- */
  const { data: notifPrefs = null } = useNotificationPrefsQuery(profileId);
  const upsertNotificationPrefs = useUpsertNotificationPrefs().mutateAsync;

  const saveNotificationPrefs = async (prefsObj: any) => {
    if (!profileId) return;
    await upsertNotificationPrefs({ profile_id: profileId, ...prefsObj });
  };

  const value: SettingsContextValue = {
    prefs,
    saveUiPreferences,
    privacyPrefs,
    privacyOthers: usePrivacySettingsQuery,
    savePrivacySettings,
    notifPrefs,
    saveNotificationPrefs,
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
