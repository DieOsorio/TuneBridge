import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to access signOut
import { useView } from "../../context/ViewContext";
import { useTranslation } from "react-i18next";

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
        <div className="absolute right-0 w-42 bg-gray-900 text-white rounded-md shadow-lg mt-2 p-4 transition-all border border-sky-700 z-50">
          {id ? (
            <ul className="space-y-2">
              <li className="md:hidden">
                <Link
                  to="/explore"
                  className="block px-4 border-b border-sky-700 py-2 text-lg hover:bg-gray-800 rounded-md transition"
                  onClick={() => {
                    manageView(null, "postsList");
                    toggleMenu();
                  }}
                >
                  {t("nav.links.explore")}
              </Link>
            </li>
            <li className="md:hidden">
              <Link
                to={`/profile/${id}`}
                className="block px-4 py-2 text-lg border-b border-sky-700 hover:bg-gray-800 rounded-md transition"
                onClick={() => {
                  manageView("about", "profile");
                  toggleMenu();
                }}
              >
                {t("nav.links.profile")}
              </Link>
            </li>
            <li>
              <button
                onClick={signOut}
                className="w-full text-left border-b border-sky-700 px-4 py-2 text-lg hover:bg-gray-800 rounded-md transition"
              >
                {t("nav.auth.signOut")}
              </button>
            </li>
          </ul>
          ) : (
            <ul className="space-y-2">
              <li>
                <Link
                  onClick={toggleMenu}
                  to="/login"
                  className="block px-4 py-2 text-lg border-b border-sky-700 hover:bg-gray-800 rounded-md transition"
                >
                  {t("nav.auth.signIn")}
                </Link>
              </li>
              <li>
                <Link
                  onClick={toggleMenu}
                  to="/signup"
                  className="block px-4 py-2 text-lg border-b border-sky-700 hover:bg-gray-800 rounded-md transition"
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
