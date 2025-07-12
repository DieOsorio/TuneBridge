import { useNavigate } from "react-router-dom"
import PlusButton from "../../ui/PlusButton"


function GroupPosts({groupId, isMember }) {
  
  return (
    <PlusButton 
      to={{ pathname: "/create-post", state: { groupId } }}
      label="create post"
      color="amber" 
    />
  )
}

export default GroupPosts