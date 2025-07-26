import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePosts } from "../context/social/PostsContext";
import { useProfile } from "../context/profile/ProfileContext";
import PostsList from "../components/social/PostsList";
import ProfilesList from "../components/profiles/ProfilesList";
import ErrorMessage from "../utils/ErrorMessage";
import { useAuth } from "../context/AuthContext";

export default function Hashtag() {
  const { hashtag } = useParams<{ hashtag: string }>();
  const { t } = useTranslation(["ui", "posts", "profiles"]);
  const { searchPosts } = usePosts();
  const { searchProfiles } = useProfile();
  const { user } = useAuth();
  const [view, setView] = useState<string>("posts");

  // Search for posts and profiles with the hashtag
  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    error: errorPosts,
  } = searchPosts(`#${hashtag}`);
  const {
    data: profiles = [],
    isLoading: isLoadingProfiles,
    error: errorProfiles,
  } = searchProfiles(`#${hashtag}`);

  // Filter out the current user from profiles
  const filteredProfiles = profiles
  .filter((profile) => profile.id !== user?.id)
  .map((profile) => ({ ...profile, username: profile.username || "" }));

  return (
    <div className="min-h-screen text-white p-4">
      <div className="text-center py-8 bg-gradient-to-r mb-3 from-sky-950 via-sky-900 to-sky-950 rounded-b-lg shadow-lg flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
          #{hashtag}
        </h1>
        <p className="text-lg text-cyan-200/90 font-light tracking-wide">
          {t("ui:hashtags.description", { hashtag })}
        </p>
      </div>
      {/* Navigation Bar */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setView("posts")}
            className={`px-4 py-2 text-lg font-medium transition rounded-lg ${
              view === "posts"
                ? "border-b-2 border-sky-600 text-sky-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t("ui:explore.tabs.posts")}
          </button>
          <button
            onClick={() => setView("profiles")}
            className={`px-4 py-2 text-lg font-medium transition rounded-lg ${
              view === "profiles"
                ? "border-b-2 border-sky-600 text-sky-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t("ui:explore.tabs.profiles")}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {view === "posts" && (
          <div className="mx-auto text-center md:col-span-2">
            {/* Posts Section */}
            {isLoadingPosts ? (
              <p>{t("ui:loading")}</p>
            ) : errorPosts ? (
              <ErrorMessage error={errorPosts.message} />
            ) : posts.length > 0 ? (
              <PostsList profileId={null} posts={posts} disableSearch={true} isOwnProfile={false} />
            ) : (
              <p className="text-gray-400">{t("posts:hashtags.empty")}</p>
            )}
          </div>
        )}
        {view === "profiles" && (
          <div className="mx-auto text-center md:col-span-2">
            {/* Profiles Section */}
            {isLoadingProfiles ? (
              <p>{t("ui:loading")}</p>
            ) : errorProfiles ? (
              <ErrorMessage error={errorProfiles.message} />
            ) : filteredProfiles.length > 0 ? (
              <ProfilesList profiles={filteredProfiles} />
            ) : (
              <p className="text-gray-400">{t("profile:hashtags.empty")}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
