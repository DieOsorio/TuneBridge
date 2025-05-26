import { useEffect } from "react";
import ProfilesList from "../components/profiles/ProfilesList";
import PostsList from "../components/social/PostsList";
import { useView } from "../context/ViewContext";
import { FaCompass } from "react-icons/fa";

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
      <div className="text-center py-8 bg-gradient-to-r mb-3 from-sky-950 via-sky-900 to-sky-950 rounded-b-lg shadow-lg flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <FaCompass className="text-cyan-400 text-4xl animate-pulse" />
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            Explore
          </h1>
        </div>
        <p className="text-lg max-w-xl mx-auto text-cyan-200/90 font-light tracking-wide">
          Dive into posts and profiles crafted by creators just like you.
        </p>

        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {["Music", "Art", "Technology", "Culture", "Inspiration"].map((tag) => (
            <span
              key={tag}
              className="text-xs cursor-pointer rounded-full bg-sky-600 px-3 py-1 font-semibold text-cyan-100 hover:bg-sky-500 transition"
            >
              #{tag}
            </span>
          ))}
        </div>
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