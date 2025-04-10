import { useEffect } from "react";
import ProfilesList from "../components/profiles/ProfilesList"
import PostsList from "../components/social/PostsList"
import Button from "../components/ui/Button"
import { useView } from "../context/ViewContext"


function Explore() {
  const { externalView, setExternalView } = useView();

  useEffect(() => {
      if (!externalView) {
        setExternalView("postsList");
      }
    }, [externalView, setExternalView]);

  return (
    <>
      <div className="flex gap-2 justify-center p-4">
      <Button onClick={() => setExternalView("postsList")}>Posts</Button>
      <Button onClick={() => setExternalView("profilesList")}>Profiles</Button>
      </div>
      {externalView==="profilesList" && <ProfilesList />}
      {externalView==="postsList" && <PostsList />}
    </>
  )
}

export default Explore