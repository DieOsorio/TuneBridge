import { useParams } from "react-router-dom";
import { useProfileGroups } from "../context/profile/ProfileGroupsContext"; // CRUD for profile_groups
import { useProfileGroupMembers } from "../context/profile/ProfileGroupMembersContext"; // CRUD for profile_group_members
import { useAuth } from "../context/AuthContext"; // Import the AuthContext to get the logged-in user
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage";
import GroupHeader from "../components/profiles/group/GroupHeader"; // Header for group info
import { useTranslation } from "react-i18next";
import GroupMembers from "../components/profiles/group/GroupMembers";
import { useView } from "../context/ViewContext";
import GroupForm from "../components/profiles/group/GroupForm";

const ProfileGroup = () => {
  const { externalView, internalView, manageView } = useView(); // Manage internal/external views
  const { groupId } = useParams(); // Get the group ID from the URL
  const { user } = useAuth(); // Get the logged-in user's info
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const { 
    fetchGroupMembers, 
    addGroupMember, 
    removeGroupMember,
    updateGroupMember, 
  } = useProfileGroupMembers(); // Fetch group members, add and remove members
 
  const { t } = useTranslation("profileGroup");

  // Fetch group data
  const { 
    data: groupData, 
    isLoading: groupLoading, 
    error: groupError 
  } = fetchProfileGroup(groupId);

  // Fetch group members
  const { 
    data: groupMembers, 
    isLoading: membersLoading, 
    error: membersError,
    refetch 
  } = fetchGroupMembers(groupId);
    
  if (groupLoading || membersLoading) {
    return <Loading />;
  }

  if (groupError || membersError) {
    return <ErrorMessage error={groupError?.message || membersError?.message || t("errors.loading")} />;
  }

  if (!groupData) {
    return <div>{t("errors.noData")}</div>;
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
        {(externalView === "group" || externalView == "") && (internalView === "members" || internalView == "") &&
        (<GroupMembers
          groupId={groupId}
          groupMembers={groupMembers}
          isAdmin={isAdmin}
          user={user}
          addGroupMember={addGroupMember}
          removeGroupMember={removeGroupMember}
          updateGroupMember={updateGroupMember}
          refetch={refetch}
        />  )  }
        {externalView === "group" && internalView === "edit" &&
        <GroupForm
          group={groupData}
          onSave={() => manageView("members", "group")}
          onCancel={() => manageView("members", "group")}
        />
        }     
      </div>
    </div>
  );
};

export default ProfileGroup;