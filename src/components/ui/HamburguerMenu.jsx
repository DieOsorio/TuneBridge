import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { FaBolt, FaCompass, FaUser } from "react-icons/fa";
import { MdCampaign, MdLogin, MdPersonAdd, MdLogout } from "react-icons/md";

const HamburgerMenu = ({ id }) => {
  const { t }              = useTranslation("ui");
  const [isOpen, setOpen]  = useState(false);
  const { signOut }        = useAuth();

  const toggle = () => setOpen((o) => !o);

  return (
    <div className="relative">
      {/* burger */}
      <button
        className="p-3 text-white"
        onClick={toggle}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-8 h-8 text-white transition-transform hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* dropdown */}
      {isOpen && (
        <div className="absolute right-5 z-50 mt-2 w-55 rounded-md bg-gray-900 p-4 text-white shadow-lg border border-sky-700">
          {id ? (
            <ul className="space-y-2">
              {/* profile */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <FaUser size={22} className="text-sky-600" />
                <Link to={`/profile/${id}`} className="text-lg" onClick={toggle}>
                  {t("nav.links.profile")}
                </Link>
              </li>

              {/* explore */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <FaCompass size={22} className="text-sky-600" />
                <Link to="/explore" className="text-lg" onClick={toggle}>
                  {t("nav.links.explore")}
                </Link>
              </li>

              {/* ads */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <MdCampaign size={28} className="text-sky-600" />
                <Link to="/ads" className="text-lg" onClick={toggle}>
                  {t("nav.links.ads")}
                </Link>
              </li>

              {/* matches */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <FaBolt size={24} className="text-sky-600" />
                <Link to="/matches" className="text-lg" onClick={toggle}>
                  {t("nav.links.matches")}
                </Link>
              </li>

              {/* sign‑out */}
              <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <MdLogout size={26} className="text-sky-600" />
                <button onClick={signOut} className="text-lg cursor-pointer">
                  {t("nav.auth.signOut")}
                </button>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2">
              {/* explore (guest) */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <FaCompass size={24} className="text-sky-600" />
                <Link to="/explore" className="text-lg" onClick={toggle}>
                  {t("nav.links.explore")}
                </Link>
              </li>

              {/* ads (guest) */}
              <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <MdCampaign size={24} className="text-sky-600" />
                <Link to="/ads" className="text-lg" onClick={toggle}>
                  {t("nav.links.ads")}
                </Link>
              </li>

              {/* sign‑in */}
              <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <MdLogin size={26} className="text-sky-600" />
                <Link to="/login" className="text-lg" onClick={toggle}>
                  {t("nav.auth.signIn")}
                </Link>
              </li>

              {/* sign‑up */}
              <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <MdPersonAdd size={24} className="text-sky-600" />
                <Link to="/signup" className="text-lg" onClick={toggle}>
                  {t("nav.auth.signUp")}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
