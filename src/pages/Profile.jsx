import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileAvatar from "../components/user/ProfileAvatar";
import DisplayMusicInfo from "../components/music/DisplayMusicInfo";
import Sidebar from "../components/profiles/Sidebar";
import EditProfile from "../components/user/EditProfile";
import EditMusicInfo from "../components/music/EditMusicInfo";
import { useProfile } from "../context/profile/ProfileContext";
import { useAuth } from "../context/AuthContext";
import Loading from "../utilis/Loading";

const Profile = () => {
  const { identifier } = useParams(); // Get the profile identifier from the URL
  const { user, loading: authLoading } = useAuth(); // Get the logged-in user's info
  const { loading: profileLoading, error, fetchProfile } = useProfile();
  const [profile, setProfile] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // Default to null
  const navigate = useNavigate();

  const stableProfileId = useMemo(() => profile?.id, [profile?.id]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const profileData = await fetchProfile(identifier || user.id);
        if (profileData) {
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    getProfile();
  }, [user, identifier]);

  if (authLoading || profileLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>No se encontró el perfil.</div>;
  }

  if (!profile) {
    return <div>No profile data available.</div>;
  }

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile = user?.id === identifier;

  return (
    <div className="flex">
      {/* Render Sidebar only if it's the user's own profile */}
      {isOwnProfile && <Sidebar onSelectOption={setSelectedOption} avatarUrl={profile?.avatar_url} />}

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-4xl mx-auto gap-8">
        {/* Render based on selectedOption */}
        {selectedOption === "editProfile" && <EditProfile profile={profile} />}
        {selectedOption === "editMusicInfo" && <EditMusicInfo profileId={stableProfileId} />}

        {/* Default Profile View */}
        {selectedOption === null && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <ProfileAvatar avatar_url={profile?.avatar_url} />
              <h2 className="text-3xl font-bold">{profile?.username}</h2>
            </div>
            <ul className="space-y-4 text-lg">
              <li>
                <strong className="mr-3">Nombre:</strong> {profile?.firstname}
              </li>
              <li>
                <strong className="mr-3">Apellido:</strong> {profile?.lastname}
              </li>
              <li>
                <strong className="mr-3">País:</strong> {profile?.country}
              </li>
              <li>
                <strong className="mr-3">Ciudad:</strong> {profile?.city}
              </li>
              <li>
                <strong className="mr-3">Género:</strong> {profile?.gender}
              </li>
              <li>
                <strong className="mr-3">Fecha de Nacimiento:</strong>{" "}
                {profile?.birthdate ? profile.birthdate.split("T")[0] : null}
              </li>
            </ul>
            <DisplayMusicInfo profileId={stableProfileId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
