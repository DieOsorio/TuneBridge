import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/social/chat/MessagesContext";
import i18n from "@/i18n";

import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/solid"; 

import HamburgerMenu from "./HamburguerMenu";
import Logo from "./Logo";

const Navbar = () => {
  const { t } = useTranslation(["ui", "profile"]);
  const { user } = useAuth();
  const location = useLocation();
  const { totalUnreadMessages } = useMessages();
  const { data: unreadMessagesCount, isLoading: loadingUnreadMessages } = totalUnreadMessages(user?.id ?? "");

  const isActive = (path: string) => location.pathname === path;
  const navigate = useNavigate();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <nav className="w-full bg-gradient-to-t from-gray-950 to-gray-800 shadow-lg text-gray-300 p-4 flex items-center justify-between relative z-20">
      <Link to="/" className="flex items-center gap-2">
        <Logo />
      </Link>

      {/* center navigation links */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
        <Link
          to="/explore"
          className={`font-medium ${
            isActive("/explore") ? "text-sky-400" : "hover:text-sky-300"
          }`}
        >
          {t("nav.links.explore")}
        </Link>

        <Link
          to="/ads"
          className={`font-medium ${
            isActive("/ads") ? "text-sky-400" : "hover:text-sky-300"
          }`}
        >
          {t("nav.links.ads")}
        </Link>

        {user && (
          <Link
            to="/matches"
            className={`font-medium ${
              isActive("/matches") ? "text-sky-400" : "hover:text-sky-300"
            }`}
          >
            {t("nav.links.matches")}
          </Link>
        )}

        {user && (
          <Link
            to={`/profile/${user.id}`}
            className={`font-medium ${
              isActive(`/profile/${user.id}`) ? "text-sky-400" : "hover:text-sky-300"
            }`}
          >
            {t("nav.links.profile")}
          </Link>
        )}

        {user && (
          <Link
            to={`/profile/${user.id}/groups`}
            className={`font-medium ${
              isActive(`/profile/${user.id}/groups`)
                ? "text-amber-600"
                : "hover:text-amber-400"
            }`}
          >
            {t("nav.links.groups")}
          </Link>
        )}
      </div>

      {/* right‑side controls */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative">
            <ChatBubbleBottomCenterTextIcon
              className="w-8 h-8 text-gray-300 cursor-pointer"
              onClick={() => navigate("/chat")}
              title={t("profile:profile.titles.chat")}
            />
            {!loadingUnreadMessages && (unreadMessagesCount?.total ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {unreadMessagesCount?.total}
              </span>
            )}
          </div>
        )}
        <select
          onChange={handleLanguageChange}
          value={i18n.language}
          className="bg-gray-800 text-white rounded px-2 py-1 text-sm border border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="en">{t("nav.language.english")}</option>
          <option value="es">{t("nav.language.spanish")}</option>
        </select>

        {user ? <HamburgerMenu id={user.id} /> : <HamburgerMenu />}
      </div>
    </nav>
  );
};

export default Navbar;
