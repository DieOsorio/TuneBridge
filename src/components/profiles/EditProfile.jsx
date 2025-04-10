import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import Loading from "../../utils/Loading";
import { uploadAvatar } from "../../utils/avatarUtils";
import { useView } from "../../context/ViewContext";
import { useProfileQuery } from "../../context/profile/profileActions";
import ImageUploader from "../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";


const EditProfile = ({profile}) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading} = useProfileQuery(profile.id);
  const { updateProfile } = useProfile();
  const { setExternalView } = useView();

  const [bio, setBio] = useState("");
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

  const avatarClickRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
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

  const handleAvatarUpdate = (file) => {
    if (file.lenght > 0) {
      setSelectedFile(file[0]);
      setPreview(URL.createObjectURL(file[0]));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError("");

    try {
      let avatar = avatar_url;

      if (selectedFile) {
        const uploadedURL = uploadAvatar(selectedFile, user.id, avatar_url);
        if (uploadedURL) {
          avatar = uploadedURL;
          setAvatar_url(avatar);
        }
      }

      await updateProfile({
        avatar_url: avatar,
        bio,
        username,
        gender,
        country,
        city,
        firstname,
        lastname,
        birthdate,
        id: user.id,
      });
      setExternalView("profile"); // back to profile page

    } catch (error) {
      setLocalError(error.message || "Error updating profile.");
    } finally {
      setIsSubmitting(false)
    }
  };

  if (profileLoading || authLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center text-gray-950 justify-center min-h-screen p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-150">
        <h2 className="text-2xl font-semibold text-center mb-4">Editar Perfil</h2>
        {user && 
          <div ref={avatarClickRef} className="relative w-fit cursor-pointer group">
            <ProfileAvatar avatar_url={preview || avatar_url} />
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-80 transition-opacity">
              <IoIosCamera size={20} className="text-gray-700" />
            </div>
          </div>
        }
        <div className="my-4">
          <ImageUploader onFilesUpdate={handleAvatarUpdate} amount={1} triggerRef={avatarClickRef} />
        </div>
        {localError && <p className="text-red-500 text-sm">{localError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-24 resize-none p-2"
          />
        </div>
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
          <Button className="mt-8 ml-88" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
