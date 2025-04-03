import ProfilesList from "../components/profiles/ProfilesList"
import { useAuth } from "../context/AuthContext"


function Explore() {
  const { user } = useAuth()
  return (
    <>
      <ProfilesList />
    </>
  )
}

export default Explore