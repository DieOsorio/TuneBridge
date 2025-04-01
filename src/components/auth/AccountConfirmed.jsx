import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Loading from "../../utilis/Loading";

const AccountConfirmed = () => {
  const { user, loading } = useAuth();
  const { createProfile, loading:profileLoading } = useProfile();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    // Verificar si el perfil ya fue creado
    if (user && !profileCreated) {
      createProfile(user.id, user.email).then(() => {
        setProfileCreated(true); // Cambiar el estado para que no se vuelva a ejecutar
      });
    }
  }, []);
  
  if (loading || profileLoading) {
    return <Loading />;
  }

  return (
    <div className="text-center py-6">
      <h1 className="text-3xl font-bold text-green-300">¡Cuenta confirmada!</h1>
      <p className="mt-4 text-lg text-gray-600">Tu cuenta ha sido confirmada exitosamente.</p>
      {loading && <p>Cargando perfil...</p>}
    </div>
  );
};

export default AccountConfirmed;
