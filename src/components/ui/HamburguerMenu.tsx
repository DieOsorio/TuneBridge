import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

import {
  BoltIcon,
  UserIcon,
  MegaphoneIcon,
  ArrowRightStartOnRectangleIcon,
  UserPlusIcon,
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { FaCompass } from "react-icons/fa";

export interface HamburgerMenuProps {
  id?: string;
  isFullBan?: boolean;
}

const HamburgerMenu = ({ id, isFullBan }: HamburgerMenuProps) => {
  const { t } = useTranslation("ui");
  const [isOpen, setOpen] = useState(false);
  const { signOut } = useAuth();

  const toggle = () => setOpen((o) => !o);

  return (
    <div className="relative">
      {/* burger */}
      <button
        className="p-3 text-white relative w-10 h-10 cursor-pointer"
        onClick={toggle}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out ${
            isOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"
          } text-[35px]`}
        >
          <Bars3Icon className="w-8 h-8" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
          } text-[35px]`}
        >
          <XMarkIcon className="w-8 h-8" />
        </span>
      </button>
      {/* dropdown */}
      {isOpen && (
        <div className="absolute right-5 z-50 mt-2 w-55 rounded-md bg-gray-900 p-4 text-white shadow-lg border border-sky-700">
          {id ? (
            isFullBan ? (
              <ul className="space-y-2">
                {/* sign‑out */}
                <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <ArrowLeftStartOnRectangleIcon className="text-sky-600 w-5 h-5" />
                  <button onClick={signOut} className="text-lg cursor-pointer">
                    {t("nav.auth.signOut")}
                  </button>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2">
                {/* profile */}
                <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <UserIcon className="w-5 h-5 text-sky-600" />
                  <Link to={`/profile/${id}`} className="text-lg" onClick={toggle}>
                    {t("nav.links.profile")}
                  </Link>
                </li>
                {/* explore */}
                <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <FaCompass className="w-5 h-5 text-sky-600" />
                  <Link to="/explore" className="text-lg" onClick={toggle}>
                    {t("nav.links.explore")}
                  </Link>
                </li>
                {/* ads */}
                <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <MegaphoneIcon className="w-5 h-5 text-sky-600" />
                  <Link to="/ads" className="text-lg" onClick={toggle}>
                    {t("nav.links.ads")}
                  </Link>
                </li>
                {/* matches */}
                <li className="md:hidden flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <BoltIcon className="w-5 h-5 text-sky-600" />
                  <Link to="/matches" className="text-lg" onClick={toggle}>
                    {t("nav.links.matches")}
                  </Link>
                </li>
                {/* settings */}
                <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <Cog6ToothIcon className="w-5 h-5 text-sky-600" />
                  <Link to="/settings" className="text-lg" onClick={toggle}>
                    {t("nav.links.settings")}
                  </Link>
                </li>
                {/* sign‑out */}
                <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                  <ArrowLeftStartOnRectangleIcon className="text-sky-600 w-5 h-5" />
                  <button onClick={signOut} className="text-lg cursor-pointer">
                    {t("nav.auth.signOut")}
                  </button>
                </li>
              </ul>
            )
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
                <MegaphoneIcon className="w-5 h-5 text-sky-600" />
                <Link to="/ads" className="text-lg" onClick={toggle}>
                  {t("nav.links.ads")}
                </Link>
              </li>
              {/* sign‑in */}
              <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <ArrowRightStartOnRectangleIcon className="text-sky-600 w-5 h-5" />
                <Link to="/login" className="text-lg" onClick={toggle}>
                  {t("nav.auth.signIn")}
                </Link>
              </li>
              {/* sign‑up */}
              <li className="flex items-center justify-between rounded-md px-4 py-2 border-b border-sky-700 hover:bg-gray-800 transition">
                <UserPlusIcon className="text-sky-600 w-5 h-5" />
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
