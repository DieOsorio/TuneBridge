import { Routes, Route, Navigate } from "react-router-dom";
import ProfileSettings from "../components/profiles/ProfileSettings";
import MusicSettings from "../components/music/MusicSettings";
import MediaSettings from "../components/music/MediaSettings";
import SettingsSidebar from "../components/profiles/SettingsSidebar";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";
import { useMediaQuery } from "@mui/material";
import AccountSettings from "../components/auth/AccountSettings";
import PrivacySettings from "../components/settings/PrivacySettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import ProviderSettings from "../components/settings/ProviderSettings";

const Settings = () => {
    const { user } = useAuth();
    const { fetchProfile } = useProfile();
    const { data: profile } = fetchProfile(user.id);

    const isDesktop = useMediaQuery("(min-width:760px)");


    return (
        <div className="settings-layout flex min-h-screen bg-gray-950 text-white">
            <SettingsSidebar
                avatarUrl={profile?.avatar_url}
            />

            {/* si el sidebar está visible en desktop, deja margen izquierdo; en mobile ocupa todo */}
            <div className="settings-content flex-grow p-6 overflow-auto max-w-4xl ml-auto md:!mx-auto">
                <Routes>
                    <Route path="profile" element={<ProfileSettings profile={profile} />} />
                    <Route path="music"   element={<MusicSettings profileId={user.id} />} />
                    <Route path="media"   element={<MediaSettings />} />
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