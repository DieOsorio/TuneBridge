import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "../components/user/ProfileAvatar";
import MusicInfo from "../components/user/MusicInfo";
import Button from "../components/ui/Button";
import { useProfile } from "../context/ProfileContext";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";


const Profile = () => {
  const {user, loading: authLoading} = useAuth();
  const { profile, loading: profileLoading, error, fetchProfile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user]);

  if (authLoading || profileLoading) {
    return <Loading />;
  }
  if (error) {
    return <div>No se encontro el perfil.</div>
  }

  return (
    <div className="flex flex-col items-center p-8 max-w-4xl mx-auto gap-8">
      <ProfileAvatar avatar_url={profile?.avatar_url} />
      <h2>{profile?.username}</h2>
      <MusicInfo 
      instrument={profile?.instrument}
      is_singer={profile?.is_singer}
      is_composer={profile?.is_composer}  
      />
      <Button  onClick={() => navigate(`/edit-profile/${profile?.id}`)}> Editar Perfil </Button>
    </div>
  );
};

export default Profile;
