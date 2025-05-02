import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to access user state
import HamburgerMenu from "./HamburguerMenu";
import { useView } from "../../context/ViewContext";

const Navbar = () => {
  const { user } = useAuth();
  const { manageView } = useView();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-gradient-to-t from-gray-950 to-gray-800 shadow-lg text-gray-300 p-4 flex items-center justify-between relative z-20">
      {/* Logo Placeholder */}
      <Link to="/" className="flex items-center gap-2">
        {/* <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">TB</span>
        </div> */}
        <h3 className="text-2xl font-bold">TuneBridge</h3>
      </Link>

      {/* Navigation Links (Hidden on Small Screens) */}
      <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-8 items-center">
        {user && (
          <Link
            to="/explore"
            onClick={() => manageView(null, "postsList")}
            className={`font-medium ${
              isActive("/explore")
                ? "text-sky-400"
                : "hover:text-sky-300"
            }`}
          >
            Explore
          </Link>
        )}
        {user && (
          <Link
            to={`/profile/${user.id}`}
            onClick={() => manageView("about", "profile")}
            className={`font-medium ${
              isActive(`/profile/${user.id}`)
                ? "text-sky-400"
                : "hover:text-sky-300"
            }`}
          >
            Profile
          </Link>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          // Hamburger Menu for Small Screens
          <HamburgerMenu id={user.id} />
        ) : (
          <Link
            to="/login"
            className="font-medium bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
