import { useState } from "react";
import { useParams } from "react-router-dom";
import ProfileAvatar from "../components/profiles/ProfileAvatar"
import DisplayMusicInfo from "../components/music/DisplayMusicInfo";
import Sidebar from "../components/profiles/Sidebar";
import EditProfile from "../components/profiles/EditProfile";
import EditMusicInfo from "../components/music/EditMusicInfo";
import { useAuth } from "../context/AuthContext";
import { useProfileQuery } from "../context/profile/profileActions";
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage"
import ConnectionsList from "../components/social/ConnectionsList";
import Button from "../components/ui/Button";
import CreatePost from "../components/social/CreatePost";

const Profile = () => {

  const { identifier } = useParams(); // Get the profile identifier from the URL
  const { user, loading: authLoading } = useAuth(); // Get the logged-in user's info
  const { data: profileData, isLoading: profileQueryLoading, error } = useProfileQuery(user, identifier);
  // const [profile, setProfile] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // Default to null


  if (authLoading || profileQueryLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error.message || "Error loading profile."} />;
  }

  if (!profileData) {
    return <div>No profile data available.</div>;
  }

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile = user.id === identifier;

  return (
    <div className="flex">
      {/* Render Sidebar only if it's the user's own profile */}
      {isOwnProfile && <Sidebar onSelectOption={setSelectedOption} avatarUrl={profileData.avatar_url} />}

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-4xl mx-auto gap-8">
        {/* Render based on selectedOption */}
        {selectedOption === "createPost" && <CreatePost id={user.id} onUpdate={() =>setSelectedOption(null)} />}
        {selectedOption === "editProfile" && <EditProfile profile={profileData} onUpdate={()=>setSelectedOption(null)} />}
        {selectedOption === "editMusicInfo" && <EditMusicInfo profileId={profileData.id} onUpdate={()=>setSelectedOption(null)} />}

        {/* Default Profile View */}
        {selectedOption === null && (
          <div className="bg-white shadow-md rounded-lg p-6">

            <div className="flex justify-end mb-4">
              <Button onClick={() => setSelectedOption("createPost")}>Create Post</Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <ProfileAvatar avatar_url={profileData.avatar_url} />
              <h2 className="text-3xl font-bold">{profileData.username}</h2>
            </div>

            <ul className="space-y-4 text-lg">
              <li>
                <strong className="mr-3">Nombre:</strong> {profileData.firstname}
              </li>
              <li>
                <strong className="mr-3">Apellido:</strong> {profileData.lastname}
              </li>
              <li>
                <strong className="mr-3">País:</strong> {profileData.country}
              </li>
              <li>
                <strong className="mr-3">Ciudad:</strong> {profileData.city}
              </li>
              <li>
                <strong className="mr-3">Género:</strong> {profileData.gender}
              </li>
              <li>
                <strong className="mr-3">Fecha de Nacimiento:</strong>{" "}
                {profileData?.birthdate ? profileData.birthdate.split("T")[0] : null}
              </li>
            </ul>

            <DisplayMusicInfo profileId={profileData.id} /> 

            <ConnectionsList profileId={profileData.id} checkStatus="accepted" /> 

            {/* <h3 className="text-xl font-semibold mt-4">Conexiones Pendientes</h3> */}
            {isOwnProfile && <ConnectionsList profileId={profileData.id} checkStatus="pending" />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
