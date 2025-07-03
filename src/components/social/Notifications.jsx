import { NavLink, Routes, Route } from "react-router-dom";
import { useTranslation }         from "react-i18next";

import NotificationsList from "./NotificationsList";
import ConnectionsList   from "./ConnectionsList";

export default function Notifications({ profileId }) {
  const { t } = useTranslation("profile");

  /* ---------- helpers ---------- */
  const base =
    "cursor-pointer px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all";
  const active   = `${base} border-b-2 border-sky-600 text-white shadow-lg`;
  const inactive = `${base} text-gray-300 hover:text-sky-600`;

  return (
    <>
      {/* internal nav */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-950 rounded-t-lg">
        <nav className="flex justify-center space-x-8 py-3">
          <NavLink
            end
            to={`/profile/${profileId}/notifications`}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {t("profile.internNav.notifications")}
          </NavLink>

          <NavLink
            to={`/profile/${profileId}/notifications/pending`}
            className={({ isActive }) => (isActive ? active : inactive)}
          >
            {t("profile.internNav.pending")}
          </NavLink>
        </nav>
      </div>

      {/* internal routes */}
      <Routes>
        {/* all notifications */}
        <Route index element={<NotificationsList profileId={profileId} />} />

        {/* pending notifications */}
        <Route
          path="pending"
          element={
            <ConnectionsList profileId={profileId} checkStatus="pending" />
          }
        />
      </Routes>
    </>
  );
}
