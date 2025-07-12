import { useNavigate } from "react-router-dom"
import PlusButton from "../../ui/PlusButton"


function GroupPosts({groupId, CanManageGroup }) {
  
  return (
    <div>
      {CanManageGroup &&
        <PlusButton 
        to={{ pathname: "/create-post", state: { groupId } }}
        label="create post"
        color="amber" 
      />
      }
    </div>
  )
}

export default GroupPosts