import { useAuth } from "../../../context/AuthContext";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useProfileGroupMembers } from "../../../context/profile/ProfileGroupMembersContext"; // Import the context
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../ui/Button";
import GroupItem from "./GroupItem"; // Import the GroupItem component
import Loading from "../../../utils/Loading";

const UserGroups = ({ profileId, isOwnProfile }) => {
  const { groupId } = useParams(); // Get the groupId from the URL parameters
  const { user } = useAuth(); // Get the current user
  const { fetchUserGroups } = useProfileGroupMembers(); // Fetch user groups from context
  const { data: groupsIds, isLoading, error } = fetchUserGroups(profileId); // Fetch groups IDs
  const navigate = useNavigate(); // For navigation

  const handleCreateGroup = () => {
    navigate("/create-profile-group"); // Navigate to the CreateProfileGroup component
  };
  
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error.message} />; 
  }

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-100">Your Groups</h2>
      {!groupsIds || groupsIds?.length === 0 ? (
        <p className="text-gray-400 text-center">
          {isOwnProfile
            ? "You are not part of any groups yet."
            : "This user is not part of any groups yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsIds?.map((group) => (
            <GroupItem key={group.id} groupId={group.id} /> // Render GroupItem for each groupId
          ))}
        </div>
      )}
      {isOwnProfile && (
        <div className="mt-6 flex justify-center">
          <Button
            className="!bg-amber-700 hover:!bg-amber-800 text-white"
            onClick={handleCreateGroup}
          >
            Create New Group
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserGroups;