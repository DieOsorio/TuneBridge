import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to access user state
import HamburgerMenu from "./HamburguerMenu";
import logo from "../../assets/logo.png";
import { useView } from "../../context/ViewContext";

const Navbar = () => {
  const { user } = useAuth();
  const { setExternalView } = useView();
  return (
    <nav className="w-full bg-sky-700 shadow-2xl text-white p-3 flex justify-between items-center">
      {/* Logo or Name */}
      <Link to="/" className="text-xl font-bold flex items-center gap-2 w-10">
        {/* <img src={logo} alt="logo" className="h-10 w-auto" /> */}
        <h3>TuneBridge</h3>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-8">
        {user && <Link to="/explore" onClick={() => setExternalView("postsList")} className="font-bold hover:text-gray-200">Explorar</Link>}
        {user && <Link to={`profile/${user.id}`} onClick={() => setExternalView("profile")} className="font-bold hover:text-gray-200">Perfil</Link>}
      </div>

      {/* Login or Hamburger Menu */}
      {user ? (
        <HamburgerMenu className="w-10" id={user.id} />
      ) : (
        <Link to="/login" className="font-bold  hover:text-gray-200">
          Iniciar sesión
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
