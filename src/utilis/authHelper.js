import { supabase } from "../supabase";

// Función de logout reutilizable
export const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    window.location.reload(); // Puedes redirigir a una página específica en lugar de recargar
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
  }
};
