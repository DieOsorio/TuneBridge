import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfileGroupMembers } from "../../context/profile/ProfileGroupMembersContext"; // Use the context
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import GroupItem from "./GroupItem"; // Import the GroupItem component

const UserGroups = () => {
  const { user } = useAuth(); // Get the current user
  const { fetchUserGroups } = useProfileGroupMembers(); // Fetch user groups from context
  const { data: groupsIds, isLoading, error } = fetchUserGroups(user?.id); // Fetch groups IDs
  const navigate = useNavigate(); // For navigation

  const handleCreateGroup = () => {
    navigate("/create-group"); // Navigate to the CreateProfileGroup component
  };

  if (isLoading) {
    return <p className="text-gray-400 text-center">Loading groups...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error.message}</p>;
  }

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-100">Your Groups</h2>
      {groupsIds.length === 0 ? (
        <p className="text-gray-400 text-center">You are not part of any groups yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupsIds.map((groupId) => (
            <GroupItem key={groupId} groupId={groupId} /> // Render GroupItem for each groupId
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-center">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={handleCreateGroup}
        >
          Create New Group
        </Button>
      </div>
    </div>
  );
};

export default UserGroups;