import { useParams } from "react-router-dom";
import { useProfileGroups } from "../context/profile/ProfileGroupsContext"; // CRUD for profile_groups
import { useProfileGroupMembers } from "../context/profile/ProfileGroupMembersContext"; // CRUD for profile_group_members
import { useAuth } from "../context/AuthContext"; // Import the AuthContext to get the logged-in user
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage";
import GroupHeader from "../components/profiles/group/GroupHeader"; // Header for group info
import GroupMembersList from "../components/profiles/group/GroupMembersList"; // List of group members

const ProfileGroup = () => {
  const { groupId } = useParams(); // Get the group ID from the URL
  const { user } = useAuth(); // Get the logged-in user's info
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const { fetchGroupMembers } = useProfileGroupMembers(); // Fetch group members

  // Fetch group data
  const { data: groupData, isLoading: groupLoading, error: groupError } = fetchProfileGroup(groupId);

  // Fetch group members
  const { data: groupMembers, isLoading: membersLoading, error: membersError } = fetchGroupMembers(groupId);

  if (groupLoading || membersLoading) {
    return <Loading />;
  }

  if (groupError || membersError) {
    return <ErrorMessage error={groupError?.message || membersError?.message || "Error loading group data."} />;
  }

  if (!groupData) {
    return <div>No group data available.</div>;
  }

  // Determine if the logged-in user is an admin
  const userRole = groupMembers?.find((member) => member.profile_id === user.id)?.role;
  const isAdmin = userRole === "admin";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent text-white">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto gap-8">
        {/* Group Header */}
        <GroupHeader groupData={groupData} isAdmin={isAdmin} />

        {/* Group Members */}
        <div className="bg-gradient-to-r from-amber-950 to-amber-800 shadow-md rounded-lg p-6 flex flex-col gap-8">
          <h2 className="text-2xl font-semibold text-gray-100">Group Members</h2>
          <GroupMembersList members={groupMembers} />
        </div>
      </div>
    </div>
  );
};

export default ProfileGroup;