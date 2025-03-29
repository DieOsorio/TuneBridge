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
  const [country, setCountry] = useState(profile?.country || "");
  const [birthdate, setBirthdate] = useState(profile?.birthdate || null);
  const [city, setCity] = useState(profile?.city || "");
  const [firstname, setFirstname] = useState(profile?.firstname || "");
  const [lastname, setLastname] = useState(profile?.lastname || "");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProfile(user.id);
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return null;

    const filePath = `${user.id}/${uuidv4()}`
    console.log(filePath);
    

    const { error } = await supabase
      .storage
      .from("avatars")
      .upload(filePath, selectedFile, 
        { 
          cacheControl: "3600",
          upsert: true 
        });

    if (error) {
      console.error("Error al subir imagen:", error);
      return avatar_url;
    }

    // const { data, error:urlError } = supabase
    // .storage
    // .from('avatars')
    // .getPublicUrl(filePath)

    const { data, error:urlError} = await supabase
    .storage
    .from('avatars')
    .createSignedUrl(filePath, 60*60)

    if (urlError) {
      console.error("Error:", urlError);
      return avatar_url;
    }
    
    setAvatar_url(data?.signedUrl)
    return data?.signedUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let avatar = avatar_url;

    if (selectedFile) {
      const uploadedURL = await uploadAvatar();
      if (uploadedURL) {
        avatar = uploadedURL;
        setAvatar_url(avatar);
      }
    }
    
    console.log("profile:", profile);

    await updateProfile(
      {
        avatar_url: avatar,
        username,
        gender,
        country,
        city,
        firstname,
        lastname,
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
        {user && <ProfileAvatar userId={profile?.id} avatar_url={preview || avatar_url} />}
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
            label="Nombre"
            placeholder={firstname}
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            label="Apellido"
            placeholder={lastname}
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            label="País"
            placeholder={country}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Input
            label="Cuidad"
            placeholder={city}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            placeholder={birthdate ? birthdate.split("T")[0] : "" }
            value={birthdate ? birthdate.split("T")[0] : ""}
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
