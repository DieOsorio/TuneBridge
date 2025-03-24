import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectAfterLogin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/edit-profile/${user.id}`);
    }
  }, [user, navigate]);

  return null; // Este componente no renderiza nada, solo maneja la redirección.
};

export default RedirectAfterLogin;
