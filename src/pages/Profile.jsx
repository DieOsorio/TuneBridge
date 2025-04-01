import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileAvatar from "../components/user/ProfileAvatar";
import MusicInfo from "../components/user/MusicInfo";
import Button from "../components/ui/Button";
import { useProfile } from "../context/profile/ProfileContext";
import { useAuth } from "../context/AuthContext";
import Loading from "../utilis/Loading";

const Profile = () => {
  const { identifier } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading, error, fetchProfile } = useProfile();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // console.log("PROFILE IDENTIFIER", identifier);
  // console.log("PROFILE INFO", profile);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profileData = await fetchProfile(identifier || user.id);
        // console.log("profileData", profileData);
        
        if (profileData) {
          setProfile(profileData);
        } else {
          // console.error("Profile data is null or undefined.");
        }
      } catch (err) {
        // console.error("Error fetching profile:", err);
      }
    };
    getProfile();
  }, [user, identifier]);

  if (authLoading || profileLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>No se encontro el perfil.</div>;
  }

  if (!profile) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className="flex flex-col items-center p-8 max-w-4xl mx-auto gap-8">
      <ProfileAvatar avatar_url={profile?.avatar_url} />
      <h2><strong className="mr-3">Usuario: </strong> {profile?.username}</h2>
      <ul>
        <li><strong className="mr-3">Nombre: </strong>{profile?.firstname}</li>
        <li><strong className="mr-3">Apellido: </strong> {profile?.lastname}</li>
        <li><strong className="mr-3">País: </strong> {profile?.country}</li>
        <li><strong className="mr-3">Cuidad: </strong>{profile?.city}</li>
        <li><strong className="mr-3">Género: </strong>{profile?.gender}</li>
        <li><strong className="mr-3">Fecha de Nacimiento: </strong>{profile?.birthdate ? profile.birthdate.split("T")[0] : null}</li>
        <Link to={profile?.avatar_url}>Avatar</Link>
      </ul>
      <Button onClick={() => navigate(`/edit-profile/${profile?.username}`)}> Editar Perfil </Button>
    </div>
  );
};

export default Profile;
