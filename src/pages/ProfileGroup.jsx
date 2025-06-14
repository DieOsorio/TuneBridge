import { useParams } from "react-router-dom";
import { useProfileGroups } from "../context/profile/ProfileGroupsContext"; // CRUD for profile_groups
import { useProfileGroupMembers } from "../context/profile/ProfileGroupMembersContext"; // CRUD for profile_group_members
import { useAuth } from "../context/AuthContext"; // Import the AuthContext to get the logged-in user
import Loading from "../utils/Loading";
import ErrorMessage from "../utils/ErrorMessage";
import GroupHeader from "../components/profiles/group/GroupHeader"; // Header for group info
import GroupMembersList from "../components/profiles/group/GroupMembersList";
import Button from "../components/ui/Button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const ProfileGroup = () => {
  const { groupId } = useParams(); // Get the group ID from the URL
  const { user } = useAuth(); // Get the logged-in user's info
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const { fetchGroupMembers, addGroupMember, removeGroupMember } = useProfileGroupMembers(); // Fetch group members, add and remove members

  const [showAddMember, setShowAddMember] = useState(false);
  const { t } = useTranslation("profileGroup");

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { newMemberId: "", newMemberRole: "member" }
  });

  // Fetch group data
  const { data: groupData, isLoading: groupLoading, error: groupError } = fetchProfileGroup(groupId);

  // Fetch group members
  const { data: groupMembers, isLoading: membersLoading, error: membersError } = fetchGroupMembers(groupId);

  if (groupLoading || membersLoading) {
    return <Loading />;
  }

  if (groupError || membersError) {
    return <ErrorMessage error={groupError?.message || membersError?.message || t("createProfileGroup.errorLoadingGroupData", "Error loading group data.")} />;
  }

  if (!groupData) {
    return <div>{t("createProfileGroup.noGroupData", "No group data available.")}</div>;
  }

  // Determine if the logged-in user is an admin
  const userRole = groupMembers?.find((member) => member.profile_id === user.id)?.role;
  const isAdmin = userRole === "admin";

  // Handler to add a new member (admin only)
  const handleAddMember = async (data) => {
    if (!data.newMemberUsername) return;
    // Fetch the user by username (assuming a fetchProfileByUsername exists)
    const { fetchProfileByUsername } = useProfileGroups();
    const userProfile = await fetchProfileByUsername(data.newMemberUsername);
    if (!userProfile || !userProfile.id) return;
    await addGroupMember({
      profile_group_id: groupId,
      profile_id: userProfile.id,
      role: data.newMemberRole,
    });
    setShowAddMember(false);
    reset();
  };

  // Handler to remove a member (admin only)
  const handleRemoveMember = async (profileId) => {
    await removeGroupMember({ profileGroupId: groupId, profileId });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-transparent text-white">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto gap-8">
        {/* Group Header */}
        <GroupHeader groupData={groupData} isAdmin={isAdmin} />

        {/* Group Members */}
        <div className="bg-gradient-to-r from-gray-900 shadow-md rounded-lg p-6 flex flex-col gap-8 w-full min-w-0 sm:min-w-[320px] sm:w-auto">
          <h2 className="text-2xl font-semibold text-gray-100">{t("createProfileGroup.groupMembers", "Group Members")}</h2>
          {isAdmin && (
            <div className="mb-4">
              {showAddMember ? (
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddMember(false)} className="!bg-gray-500 hover:!bg-gray-600">
                    {t("createProfileGroup.cancel", "Cancel")}
                  </Button>
                  <Button form="add-member-form" type="submit" className="!bg-green-700 hover:!bg-green-800">
                    {t("createProfileGroup.add", "Add")}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowAddMember(true)} className="!bg-green-700 hover:!bg-green-800">
                  {t("groupMembersList.addMember", "Add Member")}
                </Button>
              )}
              {showAddMember && (
                <form id="add-member-form" onSubmit={handleSubmit(handleAddMember)} className="flex flex-col gap-2 mt-2">
                  <Input
                    id="newMemberUsername"
                    label={t("createProfileGroup.usernameLabel", "Username")}
                    placeholder={t("createProfileGroup.usernamePlaceholder", "Enter username")}
                    register={register}
                    error={errors.newMemberUsername}
                    classForLabel="text-gray-200"
                  />
                  <Select
                    id="newMemberRole"
                    label={t("createProfileGroup.role", "Role")}
                    options={[
                      { value: "member", label: t("createProfileGroup.member", "Member") },
                      { value: "admin", label: t("createProfileGroup.admin", "Admin") },
                      { value: "musician", label: t("createProfileGroup.musician", "Musician") },
                      { value: "manager", label: t("createProfileGroup.manager", "Manager") },
                    ]}
                    register={register}
                    error={errors.newMemberRole}
                    classForLabel="text-gray-200"
                  />
                </form>
              )}
            </div>
          )}
          <GroupMembersList
            members={groupMembers}
            isAdmin={isAdmin}
            onRemoveMember={handleRemoveMember}
            currentUserId={user.id}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileGroup;