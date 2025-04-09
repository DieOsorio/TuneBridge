import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import PostsList from "../components/social/PostsList";
import { useView } from "../context/ViewContext";
import ProfileData from "../components/profiles/ProfileData";
import ProfileHeader from "../components/profiles/ProfileHeader";

const Profile = () => {

  const { identifier } = useParams(); // Get the profile identifier from the URL
  const { user, loading: authLoading } = useAuth(); // Get the logged-in user's info
  const { data: profileData, isLoading: profileQueryLoading, error } = useProfileQuery(user, identifier);
  const { selectedOption, setSelectedOption } = useView();

  useEffect(() => {
    if (!selectedOption) {
      setSelectedOption("profile");
    }
  }, [selectedOption, setSelectedOption]);
  

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
      {isOwnProfile && <Sidebar avatarUrl={profileData.avatar_url} />}

      {/* Main Content */}
      <div className="flex-1 p-8 max-w-4xl mx-auto gap-8">
        {/* Render based on selectedOption */}
        {selectedOption === "displayPosts" && <PostsList profileId={profileData.id} />}
        {isOwnProfile && selectedOption === "createPost" && <CreatePost id={user.id} />}
        {isOwnProfile && selectedOption === "editProfile" && <EditProfile profile={profileData} />}
        {isOwnProfile && selectedOption === "editMusicInfo" && <EditMusicInfo profileId={profileData.id} />}

        {/* Default Profile View */}
        {selectedOption === "profile" && (
          <div className="bg-white shadow-md rounded-lg p-6">

            <ProfileHeader profileData={profileData} isOwnProfile={isOwnProfile} />          
            
            <ProfileData profileData={profileData} />

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
