import { Routes, Route, Navigate } from "react-router-dom";
import ProfileSettings from "../components/profiles/ProfileSettings";
import MusicSettings from "../components/music/MusicSettings";
import SettingsSidebar from "../components/profiles/SettingsSidebar";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";
import { useMediaQuery } from "@mui/material";
import AccountSettings from "../components/auth/AccountSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ProviderSettings from "../components/settings/ProviderSettings";
import { useTranslation } from "react-i18next";
import { FaUser } from "react-icons/fa";
import { FiUser, FiLock } from "react-icons/fi";
import { FaLock } from "react-icons/fa";
import { BsBell, BsBellFill } from "react-icons/bs";
import { IoMusicalNotesOutline, IoMusicalNotes } from "react-icons/io5";

const Settings = () => {
  const { user } = useAuth();
  const { fetchProfile } = useProfile();
  const { data: profile } = fetchProfile(user.id);

  const isDesktop = useMediaQuery("(min-width:760px)");
  const { t } = useTranslation("ui", { keyPrefix: "sidebar" });

  // Sidebar options configured for user profile settings
  const options = [
    {
      to: "/settings/profile",
      label: t("profileSettings"),
      icon: (active) =>
        active ? (
          <img
            src={profile?.avatar_url}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover ring-2 ring-yellow-600"
          />
        ) : (
          <img
            src={profile?.avatar_url}
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
      <SettingsSidebar avatarUrl={profile?.avatar_url} options={options} />

      <div className="settings-content flex-grow p-6 overflow-auto max-w-4xl ml-auto md:!mx-auto">
        <Routes>
          <Route path="profile" element={<ProfileSettings profile={profile} />} />
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
