import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext"; // Asumiendo que tienes este contexto
import Loading from "../../pages/Loading";

const AccountConfirmed = () => {
  const { user, loading } = useAuth();
  const { createProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    const createUserProfile = async () => {
      if (user && user.email_confirmed_at) {
        try {
          // Crear perfil en la base de datos
          const profileCreated = await createProfile(user.id, user.email);
  
          if (profileCreated) {
            navigate(`/profile/${user.id}`);
          } else {
            console.error("Error al crear el perfil");
          }
        } catch (err) {
          console.error("Error al crear el perfil:", err);
          // Podrías agregar un manejo de error visual o alguna acción en caso de que falle
        }
      }
    };
  
    createUserProfile();
  }, [user, navigate, createProfile]);
  
  if (loading) {
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
