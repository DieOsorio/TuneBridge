import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HamburgerMenu from "./HamburguerMenu";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Logo from "./Logo";

const Navbar = () => {
  const { t } = useTranslation("ui");
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLanguageChange = (e) => i18n.changeLanguage(e.target.value);

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

        {/* {user && (
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
        )} */}
      </div>

      {/* right‑side controls */}
      <div className="flex items-center gap-4">
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
