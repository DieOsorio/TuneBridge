import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FaUser, FaLock } from "react-icons/fa";
import { FiUser, FiLock } from "react-icons/fi";
import { BsBell, BsBellFill } from "react-icons/bs";
import { IoMusicalNotesOutline, IoMusicalNotes } from "react-icons/io5";

import ProfileSettings from "../components/profiles/ProfileSettings";
import MusicSettings from "../components/music/MusicSettings";
import SettingsSidebar from "../components/profiles/SettingsSidebar";
import AccountSettings from "../components/auth/AccountSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ProviderSettings from "../components/settings/ProviderSettings";

import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";
import type { Profile } from "../context/profile/profileActions";

type Option = {
  to: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const Settings = () => {
  const { user } = useAuth();
  if (!user) return null;

  const { fetchProfile } = useProfile();
  const { data: profile } = fetchProfile(user.id);

  const isDesktop = useMediaQuery("(min-width:760px)");
  const { t } = useTranslation("ui", { keyPrefix: "sidebar" });

  const options: Option[] = [
    {
      to: "/settings/profile",
      label: t("profileSettings"),
      icon: (active) =>
        active ? (
          <img
            src={profile?.avatar_url ?? undefined}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover ring-2 ring-yellow-600"
          />
        ) : (
          <img
            src={profile?.avatar_url ?? undefined}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover"
          />
        ),
    },
    {
      to: "/settings/account",
      label: t("accountSettings"),
      icon: (active) => (active ? <FaUser /> : <FiUser />),
    },
    {
      to: "/settings/privacy",
      label: t("privacySettings"),
      icon: (active) => (active ? <FaLock /> : <FiLock />),
    },
    {
      to: "/settings/notifications",
      label: t("notificationsSettings"),
      icon: (active) => (active ? <BsBellFill /> : <BsBell />),
    },
    {
      to: "/settings/music",
      label: t("musicSettings"),
      icon: (active) => (active ? <IoMusicalNotes /> : <IoMusicalNotesOutline />),
    },
  ];

  return (
    <div className="settings-layout flex min-h-screen bg-gray-950 text-white">
      <SettingsSidebar avatarUrl={profile?.avatar_url ?? undefined} options={options} />

      <div className="settings-content flex-grow p-6 overflow-auto max-w-4xl ml-auto md:!mx-auto">
        <Routes>
          <Route path="profile" element={<ProfileSettings profile={profile as Profile} />} />
          <Route path="music" element={<MusicSettings profileId={user.id} />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="privacy" element={<PrivacySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="apps" element={<ProviderSettings />} />
          <Route index element={<Navigate to="profile" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Settings;
