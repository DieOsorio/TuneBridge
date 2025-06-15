import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import Button from "../../ui/Button";
import GroupMembersList from "./GroupMembersList";
import { useProfile } from "../../../context/profile/ProfileContext";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";

const GroupMembers = ({
  groupId,
  groupMembers,
  isAdmin,
  user,
  addGroupMember,
  removeGroupMember,
  updateGroupMember,
}) => {
  const { t } = useTranslation("profileGroup");
  const [showAddMember, setShowAddMember] = useState(false);
  const [usernameToSearch, setUsernameToSearch] = useState("");
  const [notFoundError, setNotFoundError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { fetchProfile } = useProfile();
  const {
    data: userProfile, 
    isLoading, 
    error
  } = fetchProfile(usernameToSearch);


  // Handler to add a new member (admin only)
  const handleAddMember = async (data) => {
    setNotFoundError("");  
    setUsernameToSearch(data.newMemberUsername);
  };

  useEffect(() => {
    if (!usernameToSearch) return;

    if (isLoading) return;

    if (error) {
      setNotFoundError(t("createProfileGroup.userNotFound", "User not found"));
      return;
    }

    if (userProfile) {
      (async () => {
        await addGroupMember({
          profile_group_id: groupId,
          profile_id: userProfile.id,
          role: watch("newMemberRole"),
        });
        setShowAddMember(false);
        reset();
        setUsernameToSearch(""); // reset para próxima búsqueda
      })();
    } else {
      setNotFoundError(t("createProfileGroup.userNotFound", "User not found"));
    }
  }, 
  [
    userProfile, 
    isLoading, 
    error, 
    usernameToSearch, 
    addGroupMember, 
    groupId, 
    reset, 
    t, 
    watch, 
    setShowAddMember
  ]);

  // Handler to update a member role (admin only)
  const handleUpdateMember = async (profileId, role) => {
    await updateGroupMember({
      profileGroupId: groupId,
      profileId,
      updates: {role: role}
    });
  }

  // Handler to remove a member (admin only)
  const handleRemoveMember = async (profileId) => {
    await removeGroupMember({ profileGroupId: groupId, profileId });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 shadow-md rounded-lg p-6 flex flex-col gap-8 w-full min-w-0 sm:min-w-[320px] sm:w-auto">
      <h2 className="text-2xl font-semibold text-gray-100">
        {t("createProfileGroup.groupMembers", "Group Members")}
      </h2>
      {isAdmin && (
        <div className="mb-4">
          {showAddMember ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddMember(false)}
                className="!bg-gray-500 hover:!bg-gray-600"
              >
                {t("createProfileGroup.cancel", "Cancel")}
              </Button>
              <Button
                form="add-member-form"
                type="submit"
                className="!bg-emerald-700 hover:!bg-emerald-800"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("createProfileGroup.adding", "Adding...")
                  : t("createProfileGroup.add", "Add")}
              </Button>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2">
              <div className="relative group flex items-center">
                <button
                  type="button"
                  onClick={() => setShowAddMember(true)}
                  className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                  <FiPlus size={28} />
                </button>
                <span
                  className="absolute left-10 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 bg-gray-900 text-emerald-500 font-semibold text-base px-3 py-1 rounded-lg shadow pointer-events-none"
                  style={{ willChange: "opacity, transform" }}
                >
                  {t("groupMembersList.addMember", "Add Member")}
                </span>
              </div>
            </div>
          )}
          {showAddMember && (
            <form
              id="add-member-form"
              onSubmit={handleSubmit(handleAddMember)}
              className="flex flex-col gap-2 mt-2"
            >
              <Input
                id="newMemberUsername"
                label={t("createProfileGroup.usernameLabel", "Username")}
                placeholder={t("createProfileGroup.usernamePlaceholder", "Enter username")}
                register={register}
                validation={{ required: t("createProfileGroup.usernameRequired", "Username is required") }}
                error={errors.newMemberUsername || notFoundError}
                classForLabel="text-gray-200"
              />
              <Select
                id="newMemberRole"
                label={t("createProfileGroup.role", "Role")}
                options={[
                  {
                    value: "member",
                    label: t("createProfileGroup.member", "Member"),
                  },
                  {
                    value: "admin",
                    label: t("createProfileGroup.admin", "Admin"),
                  },
                  {
                    value: "musician",
                    label: t("createProfileGroup.musician", "Musician"),
                  },
                  {
                    value: "manager",
                    label: t("createProfileGroup.manager", "Manager"),
                  },
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
        onUpdateMember={handleUpdateMember}
        currentUserId={user.id}
      />
    </div>
  );
};

export default GroupMembers;
