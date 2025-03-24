import { createClient } from '@supabase/supabase-js';
import Button from '../ui/Button';


const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // O redirigir a la página de inicio
  };

  return <Button onClick={handleLogout}>Cerrar sesión</Button>;
};

export default LogoutButton;
