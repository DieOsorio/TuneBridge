import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../supabase";
import HamburgerMenu from "./HamburguerMenu";
import logo from "../../assets/logo.png"

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
    <nav className="w-full bg-transparent shadow-2xl text-white p-4 flex justify-between items-center">
      {/* Logo o Nombre */}
      <Link to="/" className="text-xl font-bold flex items-center gap-2 w-10">
        <img src={logo} alt="logo" className="h-10 w-auto" />
        <h3>TuneBridge</h3>
      </Link>
      {/* Enlaces de navegación */}
      <div className="flex gap-8">
        <Link to="/explore" className="hover:underline">Explorar</Link>
        {user && <Link to={`profile/${user.id}`} className="hover:underline">Perfil</Link>}
      </div>
      {/* Botón de Logout si el usuario está autenticado, sino, mostrar Login */}
      {user ? "" : <Link to="/login" className="hover:underline">Iniciar sesión</Link>}

      {user ? <HamburgerMenu className="w-10" id={user.id} /> : null}
    </nav>
  );
};

export default Navbar;
