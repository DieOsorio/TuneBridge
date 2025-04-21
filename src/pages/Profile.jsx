import { useEffect } from "react";
import { useParams } from "react-router-dom";
import DisplayMusicInfo from "../components/music/DisplayMusicInfo";
import Sidebar from "../components/profiles/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useProfileQuery } from "../context/profile/profileActions";
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage"
import ConnectionsList from "../components/social/ConnectionsList";
import CreatePost from "../components/social/CreatePost";
import PostsList from "../components/social/PostsList";
import { useView } from "../context/ViewContext";
import ProfileData from "../components/profiles/ProfileData";
import ProfileHeader from "../components/profiles/ProfileHeader";
import Edit from "./Edit";
import Notifications from "../components/social/Notifications";

const Profile = () => {

  const { identifier } = useParams(); // Get the profile identifier from the URL
  const { user, loading: authLoading } = useAuth(); // Get the logged-in user's info
  const { data: profileData, isLoading: profileQueryLoading, error } = useProfileQuery(identifier); // Get the profile data
  const { externalView, internalView, manageView } = useView(); // Context to manage views

  // On refresh goes to profile -> about View
  useEffect(() => {
    if (!externalView) {
      manageView("about", "profile")
    }
  }, [externalView, manageView]);
  

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
        {/* Render based on externalView */}
        <ProfileHeader profileData={profileData} 
        isOwnProfile={isOwnProfile} /> 

        {/* Posts View */}
        {externalView === "displayPosts" && 
        <PostsList profileId={profileData.id} />}

        {/* Create Post View */}
        {isOwnProfile && 
        externalView === "createPost" && 
        <CreatePost id={user.id} />}

        {/* Edit View */}
        {isOwnProfile && 
        externalView === "edit" && 
        <Edit profileData={profileData} />}

        {/* Notifications View */}
        {isOwnProfile && 
        externalView === "notifications" && 
        <Notifications profileId={profileData.id} />}

        {/* Default Profile View */}
        {externalView === "profile" && (
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-8">          
          {internalView === "about" && 
          <ProfileData profileData={profileData} />}

          {internalView === "about" && 
          <DisplayMusicInfo profileId={profileData.id} />} 

          <ConnectionsList profileId={profileData.id} checkStatus="accepted" />                                   
        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
