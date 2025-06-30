import PostsList from "../components/social/PostsList";
import { FaCompass } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ProfilesSearch from "../components/profiles/ProfilesSearch";
import { Link } from "react-router-dom";
import ShinyText from "../components/ui/ShinyText";
import { useView } from "../context/ViewContext";
import { useEffect } from "react";

function Explore() {
  const { t } = useTranslation("ui");
  const {internalView, manageView } = useView();

  const tags = t("explore.tags", {returnObjects: true});

  useEffect(() => {
  if (!internalView) {
    manageView("postsList", "explore");
  }
}, [internalView, manageView]);

  return (
    <div className="min-h-screen text-white">

      {/* Header */}      
      <div className="text-center py-8 bg-gradient-to-r mb-3 from-sky-900 to-gray-950 rounded-b-lg shadow-lg flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <FaCompass className="text-sky-500 text-4xl animate-custom-pulse" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            <ShinyText text={t("explore.title")} speed={3} />
          </h1>
        </div>
        <p className="text-lg max-w-xl mx-auto text-cyan-200/90 font-light tracking-wide">
          {t("explore.description")}
        </p>

        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Link
              key={tag}
              to={`/hashtag/${tag}`}
              className="text-xs cursor-pointer rounded-full bg-sky-600 px-3 py-1 font-semibold text-cyan-100 hover:bg-sky-500 transition"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Internal Navigation Bar */}
      <div className="flex justify-center">
        <div className="flex gap-8">
          <button
            onClick={() => manageView("postsList", "explore")}
            className={`px-4 cursor-pointer border-b-2 py-2 text-lg text-gray-400 hover:text-gray-200 font-medium transition rounded-lg ${
              internalView === "postsList"
                && "border-sky-600 !text-gray-200"
            }`}
          >
            {t("explore.tabs.posts")}
          </button>
          <button
            onClick={() => manageView("profilesList", "explore")}
            className={`px-4 cursor-pointer border-b-2 text-gray-400 hover:text-gray-200 py-2 text-lg font-medium transition rounded-lg ${
              internalView === "profilesList"
                && "border-sky-600 !text-gray-200"
            }`}
          >
            {t("explore.tabs.profiles")}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {internalView === "postsList" && <PostsList />}
        {internalView === "profilesList" && <ProfilesSearch />}
      </div>
    </div>
  );
}

export default Explore;