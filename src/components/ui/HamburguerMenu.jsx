import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to access signOut
import { useView } from "../../context/ViewContext";
import { useTranslation } from "react-i18next";
import { FaRegCompass, FaRegUser } from "react-icons/fa";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { GrAnnounce } from "react-icons/gr";
import { MdLogout  } from "react-icons/md";

const HamburgerMenu = ({ id }) => {
  const { t } = useTranslation("ui");
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth(); // Access signOut from AuthContext
  const { manageView } = useView();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Hamburger Icon */}
      <button
        className="p-3 text-white focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-8 h-8 text-white cursor-pointer transition-transform transform hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-5 w-55 bg-gray-900 text-white rounded-md shadow-lg mt-2 p-4 transition-all border border-sky-700 z-50">
          {id ? (
            <ul className="space-y-2">
              <li className="md:hidden px-4 py-2  flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <FaRegCompass size={24} className="text-sky-600" />

                <Link
                  to="/explore"
                  className="block text-lg"
                  onClick={() => {
                    manageView(null, "postsList");
                    toggleMenu();
                  }}
                >
                  {t("nav.links.explore")}
                </Link>
              </li>
              <li className="md:hidden px-4 py-2  flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <GrAnnounce size={24} className="text-sky-600" />

                <Link
                  to="/ads"
                  className="block text-lg"
                  onClick={() => {
                    manageView(null, "ads");
                    toggleMenu();
                  }}
                >
                  {t("nav.links.ads")}
                </Link>
              </li>
              <li className="md:hidden px-4 py-2  flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <FaRegUser size={24} className="text-sky-600" />

                <Link
                  to={`/profile/${id}`}
                  className="block text-lg"
                  onClick={() => {
                    manageView("about", "profile");
                    toggleMenu();
                  }}
                >
                  {t("nav.links.profile")}
                </Link>
              </li>
              <li className="px-4 py-2  flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <MdLogout size={26} className="text-sky-600" />
                <button
                  onClick={signOut}
                  className="block text-lg"
                >
                  {t("nav.auth.signOut")}
                </button>
              </li>
            </ul>
            ) : (
            <ul className="space-y-2">
              <li className="px-4 py-2 flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <FiLogIn size={26} className="text-sky-600" />
                <Link
                  onClick={toggleMenu}
                  to="/login"
                  className="block text-lg"
                >
                  {t("nav.auth.signIn")}
                </Link>
              </li>
              <li className="px-4 py-2 flex justify-between rounded-md items-center border-b border-sky-700 hover:bg-gray-800 transition">
                <FiUserPlus size={24} className="text-sky-600" />
                <Link
                  onClick={toggleMenu}
                  to="/signup"
                  className="block text-lg"
                >
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
