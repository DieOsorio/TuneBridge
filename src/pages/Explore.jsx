import { useEffect } from "react";
import ProfilesList from "../components/profiles/ProfilesList"
import PostsList from "../components/social/PostsList"
import Button from "../components/ui/Button"
import { useView } from "../context/ViewContext"


function Explore() {
  const { externalView, setExternalView } = useView();

  // Check if there is an external view, if there isn't set it to postList
  useEffect(() => {
      if (!externalView) {
        setExternalView("postsList");
      }
    }, [externalView, setExternalView]);

  return (
    <>
      <div className="flex gap-2 justify-center p-4">
        {/* Select posts view */}
        <Button onClick={() => setExternalView("postsList")}>Posts</Button>
        {/* Select profiles view */}        
        <Button onClick={() => setExternalView("profilesList")}>Profiles</Button>
      </div>
      {/* List of all posts */}
      {externalView==="postsList" && <PostsList />}
      {/* List of all profiles */}
      {externalView==="profilesList" && <ProfilesList />}
    </>
  )
}

export default Explore