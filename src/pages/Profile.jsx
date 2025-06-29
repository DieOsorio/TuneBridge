import { useEffect } from "react";
import { useParams } from "react-router-dom";
import DisplayMusicInfo from "../components/music/DisplayMusicInfo";
import { useAuth } from "../context/AuthContext";
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage"
import ConnectionsList from "../components/social/ConnectionsList";
import PostsList from "../components/social/PostsList";
import { useView } from "../context/ViewContext";
import ProfileData from "../components/profiles/ProfileData";
import ProfileHeader from "../components/profiles/ProfileHeader";
import Notifications from "../components/social/Notifications";
import { useProfile } from "../context/profile/ProfileContext";
import UserGroups from "../components/profiles/group/UserGroups";
import { useTranslation } from "react-i18next";
import ProfileAds from "../components/social/ads/ProfileAds";
import MatchScoreIndicator from "../components/profiles/MatchScoreIndicator";
import PostForm from "../components/social/PostForm";

const Profile = () => {
  const { t } = useTranslation("profile"); // Initialize translation function
  const { identifier } = useParams(); // Get the profile identifier from the URL
  const { user, loading: authLoading } = useAuth(); // Get the logged-in user's info
  const { fetchProfile } = useProfile();
  const { data: profileData, isLoading: profileQueryLoading, error } = fetchProfile(identifier); // Get the profile data
  const { externalView, internalView, manageView } = useView(); // Context to manage views
  
  // On refresh, go to profile -> about View
  useEffect(() => {
    if (!externalView) {
      manageView("about", "profile");
    }
  }, [externalView, manageView]);

  if (authLoading || profileQueryLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error.message || t("profile.errorLoading")} />;
  }

  if (!profileData) {
    return <div>{t("profile.noData")}</div>;
  }

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile = user.id === identifier;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent text-white">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 gap-8">
        {/* Render based on externalView */}
        <div className="max-w-4xl y mx-auto">
          <ProfileHeader profileData={profileData} isOwnProfile={isOwnProfile} />
        </div>
        
        {/* Create Post View */}
        {isOwnProfile && externalView === "profile" && internalView === "createPost" && (
          <PostForm />
        )}

        {/* Notifications View */}
        {isOwnProfile && externalView === "notifications" && (
          <Notifications profileId={profileData.id} />
        )}
        

        {/* Default Profile View */}
        {externalView === "profile" && (
          <div className="bg-gradient-to-l max-w-4xl mx-auto to-gray-900 shadow-md rounded-lg p-6 flex flex-col gap-8">
            {/* About View */}
            {internalView === "about" && (
              <>
                <ProfileData profileData={profileData} />
                <DisplayMusicInfo profileId={profileData.id} />
              </>
            )}

            {/* Match View */}
            {!isOwnProfile && externalView === "profile" && internalView === "matchScore" && (
              <MatchScoreIndicator 
              otherProfile={profileData} />
            )}

            {/* Posts View */}
            {externalView === "profile" && internalView === "displayPosts" && (
              <PostsList 
              isOwnProfile={isOwnProfile}
              profileId={profileData.id} />
            )}

            {/* User Groups View */}
            {/* {internalView === "groups" && externalView === "profile" && (
              <UserGroups
              isOwnProfile={isOwnProfile} 
              profileId={identifier}
              />
            )} */}

            {internalView === "groups" && externalView === "profile" && (
              <div className="text-center text-gray-400 py-8">
                {t("profile.userGroupsComing")}
              </div>
            )}

            {/* Music Ads View */}
            {internalView === "ads" && externalView === "profile" && (
              <ProfileAds 
                profileId={profileData.id}
              />
            )}

            {/* Connections List View */}
            {externalView === "profile" && internalView === "about" && (
            <ConnectionsList
              profileId={profileData.id}
              checkStatus="accepted"
            />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
