import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext';

const AccountConfirmed = () => {
  const { username, session } = useAuth(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    // Si no hay sesión o si hay un error, redirige al login
    if (!session) {
      navigate('/login');
    }
  }, [navigate]);  // Dependemos de la sesión y el error para redirigir


  return (
    <div className="confirmation-container">
      <h1>¡Cuenta confirmada!</h1>
      <p>Tu cuenta ha sido confirmada exitosamente.</p>
      <p>Haz clic en el siguiente enlace para editar tu perfil:</p>
      <a href={`/edit-profile/${session.user.id}`} className="edit-profile-link">
        Editar mi perfil
      </a>
    </div>
  );
};

export default AccountConfirmed;
