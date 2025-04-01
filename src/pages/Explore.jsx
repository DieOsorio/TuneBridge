import ProfilesList from "../components/profiles/ProfilesList"
import Followers from "../components/profiles/Followers"


function Explore() {
  console.log("EXPLORE render");
  return (
    <>
      <ProfilesList />
      {/* <Followers /> */}
    </>
  )
}

export default Explore