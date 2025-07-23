import { useNavigate } from "react-router-dom";
import PlusButton from "../../ui/PlusButton";

interface GroupPostsProps {
  groupId: string;
  CanManageGroup: boolean;
}

const GroupPosts = ({ groupId, CanManageGroup }: GroupPostsProps) => {
  const navigate = useNavigate();

  return (
    <div>
      {CanManageGroup && (
        <PlusButton
          to={{ pathname: "/create-post", state: { groupId } }}
          label="create post"
          color="amber"
        />
      )}
    </div>
  );
};

export default GroupPosts;
