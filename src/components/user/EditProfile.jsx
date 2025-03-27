import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import Checkbox from "../ui/Checkbox";
import { useProfile } from "../../context/ProfileContext";
import Loading from "../../pages/Loading";

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, error, fetchProfile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [username, setUsername] = useState(profile?.username || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [avatar_url, setAvatar_url] = useState(profile?.avatar_url || "");
  const [instrument, setInstrument] = useState(profile?.instrument || "");
  const [birthdate, setBirthdate] = useState(profile?.birthdate || null);
  const [is_singer, setIs_singer] = useState(profile?.is_singer || false);
  const [is_composer, setIs_composer] = useState(profile.is_composer || false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return null;

    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`
    
    console.log("file path:", filePath);
    

    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, selectedFile, 
        { 
          cacheControl: "3600",
          upsert: false 
        });

    if (error) {
      console.error("Error al subir imagen:", error);
      return avatar_url;
    }

    const { data, error: urlError } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

    if (urlError) {
      console.error("Error al obtener la URL pública:", urlError);
      return avatar_url;
    }

    console.log(data?.publicUrl);
    
    return data?.publicUrl;

    // setAvatar_url(publicUrl); //cuando cambie a avatar privado tengo que cambiar a signed URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let avatar = avatar_url;

    if (selectedFile) {
      const uploadedURL = await uploadAvatar();
      if (uploadedURL) {
        avatar = uploadedURL;
      }
    }
    
    console.log("profile:", profile);
    await updateProfile(
      {
        avatar_url: avatar,
        username,
        gender,
        instrument,
        is_singer,
        is_composer,
        birthdate,
        id: user.id,
      }
    );

    if (!error) {
      navigate(`/profile/${user.id}`);
    }
    setLoading(false);
  };

  if (profileLoading) {
    return <Loading />
  }

    
  return (
    <div className="flex flex-col items-center text-gray-950 justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Editar Perfil</h2>
        {user && <ProfileAvatar userId={profile?.id} avatarUrl={preview || avatar_url} />}
        <div className="flex flex-col items-center">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 mb-4"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            placeholder={username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Instrumento"
            placeholder={instrument}
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          />
          <Checkbox 
            label="Cantante"
            checked={is_singer}
            onChange={(e) => setIs_singer(e.target.checked)}
          />
          <Checkbox 
            label="Compositor"
            checked={is_composer}
            onChange={(e) => setIs_composer(e.target.checked)}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            placeholder={birthdate}
            value={birthdate || ""}
            onChange={(e) => setBirthdate(e.target.value ||  null)}
          />
          <Select 
            label="Género"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            defaultOption="Selecciona tu género"
            option1="Masculino"
            option2="Femenino"
            option3="Otro"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
