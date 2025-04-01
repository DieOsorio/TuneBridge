import ProfilesList from "../components/profiles/ProfilesList"
import Followers from "../components/profiles/Followers"
import DisplayMusicInfo from "../components/music/DisplayMusicInfo"
import { useAuth } from "../context/AuthContext"


function Explore() {
  const { user } = useAuth()
  return (
    <>
      <ProfilesList />
      <DisplayMusicInfo profileId={user.id} />
      {/* <Followers /> */}
    </>
  )
}

export default Explore