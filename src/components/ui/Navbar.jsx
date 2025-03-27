import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import LogoutButton from "../auth/LogoutButton";
import HamburgerMenu from "./HamburguerMenu";

const Navbar = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center">
      {/* Logo o Nombre */}
      <Link to="/" className="text-xl font-bold">🎵 MusicConnects</Link>

      {/* Enlaces de navegación */}
      <div className="flex gap-4">
        <Link to="/explore" className="hover:underline">Explorar</Link>
        {user && <Link to={`profile/${user.id}`} className="hover:underline">Perfil</Link>}
      </div>
      {/* Botón de Logout si el usuario está autenticado, sino, mostrar Login */}
      {user ? <LogoutButton /> : <Link to="/login" className="hover:underline">Iniciar sesión</Link>}

      {user ? <HamburgerMenu /> : null}
    </nav>
  );
};

export default Navbar;
