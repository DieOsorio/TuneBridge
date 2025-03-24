import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import LogoutButton from "../auth/LogoutButton";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

const Navbar = () => {
  const [user, setUser] = useState(null);

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
    </nav>
  );
};

export default Navbar;
