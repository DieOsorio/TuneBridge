import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Loading from "../../utils/Loading";

const AccountConfirmed = () => {
  const { user, loading } = useAuth();
  const { createProfile, loading:profileLoading } = useProfile();
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    // Verificar si el perfil ya fue creado
    if (user && !profileCreated) {
      createProfile(user.id, user.email).then(() => {
        setProfileCreated(true);
      });
    }
  }, [user, profileCreated]);
  
  if (loading || profileLoading) {
    return <Loading />;
  }

  return (
    <div className="text-center py-6">
      <h1 className="text-3xl font-bold text-green-300">¡Cuenta confirmada!</h1>
      <p className="mt-4 text-lg text-gray-600">Tu cuenta ha sido confirmada exitosamente.</p>
    </div>
  );
};

export default AccountConfirmed;
