import ProfilesList from "../components/profiles/ProfilesList"
import PostsList from "../components/social/PostsList"
import Button from "../components/ui/Button"
import { useView } from "../context/ViewContext"


function Explore() {
  const { selectedOption, setSelectedOption } = useView();

  return (
    <>
      <div className="flex gap-2 justify-center p-4">
      <Button onClick={() => setSelectedOption("postsList")}>Posts</Button>
      <Button onClick={() => setSelectedOption("profilesList")}>Profiles</Button>
      </div>
      {selectedOption==="profilesList" && <ProfilesList />}
      {selectedOption==="postsList" && <PostsList />}
    </>
  )
}

export default Explore