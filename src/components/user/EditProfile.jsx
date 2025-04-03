import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import { useNavigate } from "react-router-dom";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import Loading from "../../utils/Loading";
import { uploadAvatar } from "../../utils/avatarUtils";

const EditProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, fetchProfile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [avatar_url, setAvatar_url] = useState("");
  const [country, setCountry] = useState("");
  const [birthdate, setBirthdate] = useState(null);
  const [city, setCity] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
  }, [user, profile]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setGender(profile.gender || "");
      setAvatar_url(profile.avatar_url || "");
      setCountry(profile.country || "");
      setBirthdate(profile.birthdate || null);
      setCity(profile.city || "");
      setFirstname(profile.firstname || "");
      setLastname(profile.lastname || "");
    }
  }, [profile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    try {
      let avatar = avatar_url;

      if (selectedFile) {
        const uploadedURL = await uploadAvatar(selectedFile, user.id, avatar_url);
        if (uploadedURL) {
          avatar = uploadedURL;
          setAvatar_url(avatar);
        }
      }

      await updateProfile({
        avatar_url: avatar,
        username,
        gender,
        country,
        city,
        firstname,
        lastname,
        birthdate,
        id: user.id,
      });

      navigate(`/profile/${user.id}`);
    } catch (err) {
      setLocalError("Error updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading || authLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center text-gray-950 justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Editar Perfil</h2>
        {user && <ProfileAvatar avatar_url={preview || avatar_url} />}
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 mb-4"
          />
        </div>
        {localError && <p className="text-red-500 text-sm">{localError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de usuario"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="Nombre"
            placeholder="Nombre"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            label="Apellido"
            placeholder="Apellido"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            label="País"
            placeholder="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Input
            label="Ciudad"
            placeholder="Ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Fecha de Nacimiento"
            type="date"
            placeholder="Fecha de Nacimiento"
            value={birthdate ? birthdate.split("T")[0] : ""}
            onChange={(e) => setBirthdate(e.target.value || null)}
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
