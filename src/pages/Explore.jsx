import { useEffect } from "react";
import ProfilesList from "../components/profiles/ProfilesList";
import PostsList from "../components/social/PostsList";
import { useView } from "../context/ViewContext";

function Explore() {
  const { externalView, setExternalView } = useView();

  // Check if there is an external view, if there isn't set it to postList
  useEffect(() => {
    if (!externalView) {
      setExternalView("postsList");
    }
  }, [externalView, setExternalView]);

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="text-gray-400">Discover posts and profiles from the community</p>
      </div>

      {/* Internal Navigation Bar */}
      <div className="flex justify-center">
        <div className="flex gap-8">
          <button
            onClick={() => setExternalView("postsList")}
            className={`pb-2 text-lg font-medium transition ${
              externalView === "postsList"
                ? "border-b-2 border-sky-600 text-sky-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setExternalView("profilesList")}
            className={`pb-2 text-lg font-medium transition ${
              externalView === "profilesList"
                ? "border-b-2 border-sky-600 text-sky-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Profiles
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {externalView === "postsList" && <PostsList />}
        {externalView === "profilesList" && <ProfilesList />}
      </div>
    </div>
  );
}

export default Explore;