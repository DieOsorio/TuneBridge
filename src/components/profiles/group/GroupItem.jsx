import React from "react";
import { useProfileGroups } from "../../context/profile/ProfileGroupsContext"; // Use the context
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";

const GroupItem = ({ groupId }) => {
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const navigate = useNavigate();

  // Fetch the profile group data
  const { data: group, isLoading, error } = fetchProfileGroup(groupId);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <ErrorMessage error={error.message} />
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
      <img
        src={group.avatar_url || "/default-avatar.png"}
        alt={group.name}
        className="w-20 h-20 rounded-full mb-2"
      />
      <h3 className="text-lg font-semibold text-gray-100">{group.name}</h3>
      <p className="text-sm text-gray-400">{group.bio}</p>
      <Button
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
        onClick={() => navigate(`/group/${group.id}`)}
      >
        View Group
      </Button>
    </div>
  );
};

export default GroupItem;