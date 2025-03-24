import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import ProfileAvatar from "../components/user/ProfileAvatar";
import MusicInfo from "../components/user/MusicInfo";
import Button from "../components/ui/Button";


const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchProfileData(user.id);
    }
  }, [user, navigate]);

  const fetchProfileData = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) console.error(error);
    else setProfileData(data);
  };

  if (!profileData) return <div className="text-center mt-10">Cargando perfil...</div>;

  return (
    <div className="flex flex-col items-center p-8 max-w-4xl mx-auto gap-8">
      <ProfileAvatar avatar_url={profileData.avatar_url} />
      <h2>{profileData.username}</h2>
      <MusicInfo 
      instrument={profileData.instrument}
      is_singer={profileData.is_singer}
      is_composer={profileData.is_composer}  
      />
      <Button  onClick={() => navigate(`/edit-profile/${profileData.id}`)}> Editar Perfil </Button>
    </div>
  );
};

export default Profile;
