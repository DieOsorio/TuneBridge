import { supabase } from '../../supabase';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navegate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navegate("/login")
  };

  return <Button onClick={handleLogout}>Cerrar sesión</Button>;
};

export default LogoutButton;
