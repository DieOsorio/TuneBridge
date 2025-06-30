import { createContext, useContext, useEffect, useState } from "react";
import i18n from '../../i18n';
import PropTypes from "prop-types";

import {
  useUiPreferencesQuery,
  useUpsertUiPreferences,
  usePrivacySettingsQuery,
  useUpsertPrivacySettings,
  useNotificationPrefsQuery,
  useUpsertNotificationPrefs
} from "./settingsActions";
import { useAuth } from "../AuthContext";

const SettingsContext = createContext(null);
SettingsContext.displayName = "SettingsContext";

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const profileId = user?.id;

  /* ---------- UI SETTINGS ---------- */

  // local states 
  const [prefs, setPrefs] = useState({
    lang: localStorage.getItem("lang") || "en",
    theme: localStorage.getItem("theme") || "dark",
  });

  // React-Query hooks
  const { data: dbPrefs } = useUiPreferencesQuery(profileId);
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

  const saveUiPreferences = async ({ lang, theme }) => {
    if (!profileId) return; // guest
    await upsertUiPreferences({ profile_id: profileId, lang, theme });
    setPrefs({ lang, theme });
  };

  /* ---------- PRIVACY SETTINGS ---------- */

  // React-Query hooks
  const { data: privacyPrefs = {} } = usePrivacySettingsQuery(profileId);
  const upsertPrivacy = useUpsertPrivacySettings().mutateAsync;

  const savePrivacySettings = async (newPrefs) => {
    if (!profileId) return;
    await upsertPrivacy({ profile_id: profileId, prefs: newPrefs });
  }

  /* ---------- NOTIFICATION SETTINGS ---------- */

  // React-Query hooks
  const { data: notifPrefs = null } = useNotificationPrefsQuery(profileId);
  const upsertNotificationPrefs = useUpsertNotificationPrefs().mutateAsync;

  const saveNotificationPrefs = async (prefsObj) => {
    if (!profileId) return;
    await upsertNotificationPrefs({ profile_id: profileId, ...prefsObj });
  };

  const value = {
    //ui settings
    prefs,
    saveUiPreferences,

    //privacy settings
    privacyPrefs,
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

SettingsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
};
