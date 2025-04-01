import { supabase } from "../supabase";


// Función de logout reutilizable
export const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    window.location.href = "/login"
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
  }
};


