import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      <ul>
        <li>{profile?.firstname}</li>
        <li>{profile?.lastname}</li>
        <li>{profile?.country}</li>
        <li>{profile?.city}</li>
        <li>{profile?.gender}</li>
        <li>{profile?.birthdate ? profile.birthdate.split("T")[0] : null}</li>
        <Link to={profile?.avatar_url}>Avatar</Link>
      </ul>
      <Button  onClick={() => navigate(`/edit-profile/${profile?.id}`)}> Editar Perfil </Button>
    </div>
  );
};

export default Profile;
