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
import ImageUploader from "../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";


const EditProfile = ({profile}) => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { manageView } = useView();

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
      manageView("about","profile"); // back to profile page

    } catch (error) {
      setLocalError(error.message || "Error updating profile.");
    } finally {
      setIsSubmitting(false)
    }
  };

  return (
    
      <div className="bg-white p-6 rounded-b-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Edit Profile</h2>
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
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label="First name"
            placeholder="First name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            label="Last name"
            placeholder="Last name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            label="Country"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <Input
            label="City"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Input
            label="Birthdate"
            type="date"
            placeholder="Birthdate"
            value={birthdate ? birthdate.split("T")[0] : ""}
            onChange={(e) => setBirthdate(e.target.value || null)}
          />
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            defaultOption="Choose your gender"
            option1="Male"
            option2="Female"
            option3="Other"
          />
          <Button className="mt-8 ml-73" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>
      </div>
    
  );
};

export default EditProfile;
