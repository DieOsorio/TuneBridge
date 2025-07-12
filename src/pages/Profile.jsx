import {
  Routes,
  Route,
  useParams,
} from "react-router-dom";

import { useAuth }    from "../context/AuthContext";
import { useProfile } from "../context/profile/ProfileContext";

import Loading        from "../utils/Loading";
import ErrorMessage   from "../utils/ErrorMessage";
import ProfileHeader  from "../components/profiles/ProfileHeader";

import ProfileData          from "../components/profiles/ProfileData";
import DisplayMusicInfo     from "../components/music/DisplayMusicInfo";
import ConnectionsList      from "../components/social/ConnectionsList";
import PostsList            from "../components/social/PostsList";
import PostForm             from "../components/social/PostForm";
// import UserGroups           from "../components/profiles/group/UserGroups";
import ProfileAds           from "../components/social/ads/ProfileAds";
import Notifications        from "../components/social/Notifications";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation("profileGroup", {keyPrefix: "userGroups"});
  const { identifier } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { fetchProfile } = useProfile();

  const {
    data: profile,
    isLoading,
    error,
  } = fetchProfile(identifier);

  const loading = authLoading || isLoading;

  if (loading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;
  if (!profile) return null;

  const isOwn = user.id === identifier;

  /* ---------- Internal Views ---------- */

  const About = () => (
    <>
      <ProfileData profileData={profile} />
      <DisplayMusicInfo profileId={profile.id} />
      <ConnectionsList 
        profileId={profile.id} 
        checkStatus="accepted"
        maxVisible={4} 
      />
    </>
  );

  const Posts = () => (
    <PostsList profileId={profile.id} isOwnProfile={isOwn} />
  );

  const CreatePost = () => <PostForm />;

  const Groups = () => (
    // <UserGroups profileId={profile.id} isOwnProfile={isOwn} />
    <p className="text-center text-gray-400">{t("userGroupsComing")}</p>
  );

  const Ads = () => <ProfileAds profileId={profile.id} />;

  /* ---------- UI ---------- */

  return (
    <div className="flex flex-col min-h-screen text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        <ProfileHeader profileData={profile} isOwnProfile={isOwn} />


        {/* Internal Routes */}
        <Routes>
          <Route index        element={<About />} />
          <Route path="posts" element={<Posts />} />
          <Route
            path="connections"
            element={
              <ConnectionsList
                profileId={profile.id}
                checkStatus="accepted"
              />
            }
          />

          {isOwn && (
            <Route path="create" element={<CreatePost />} />
          )}

          <Route path="groups"        element={<Groups />} />
          <Route path="ads"           element={<Ads />} />

          {isOwn && (
            <Route
              path="notifications/*"
              element={<Notifications profileId={profile.id} />}
            />
          )}
        </Routes>
      </div>
    </div>
  );
}
