import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ProfileAvatar from "../ProfileAvatar";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import ManageMembersModal from "./ManageMembersModal";

const GroupMembersList = ({ members, isAdmin, onRemoveMember, onUpdateMember }) => {
  const { user } = useAuth(); // Get the logged-in user's info
  const { t } = useTranslation("profileGroup");
  const currentUserId = user?.id; // Get the current user's ID
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  const { 
    register, 
    handleSubmit, 
    setValue,
    reset, 
    formState: { errors } 
  } = useForm();

  const [manageOpen, setManageOpen] = useState(false);
  const [manageMember, setManageMember] = useState(null);

  
  if (!members || members.length === 0) {
    return (
      <p className="text-gray-400">
        {t("groupMembersList.members") +
          ": " +
          t("groupMembersList.noMembers", "No members in this group yet.")}
      </p>
    );
  }

  const handleManageClick = (member) => {
    setManageMember(member);
    setManageOpen(true);
    setValue("editMemberRole", member.role); // set default value
  };

  const onSubmit = async (data) => {
    await onUpdateMember(manageMember.profile_id, data.editMemberRole);
    setManageOpen(false);
    setManageMember(null);
    reset();
  };

  const handleCloseManage = () => {
    setManageOpen(false);
    setManageMember(null);
    reset();
  }

  const handleRemoveClick = (profileId) => {
    setPendingRemoveId(profileId);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = () => {
    if (pendingRemoveId) {
      onRemoveMember(pendingRemoveId);
    }
    setConfirmOpen(false);
    setPendingRemoveId(null);
  };

  const handleCancelRemove = () => {
    setConfirmOpen(false);
    setPendingRemoveId(null);
  };

  return (
    <>
      <ul className="space-y-4">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-4">
            <Link to={`/profile/${member.profile_id}`}>
              <ProfileAvatar
                avatar_url={member.profiles.avatar_url}
                className="!w-16 !h-16"
              />
            </Link>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">
                {member.profiles.username}
              </h3>
              <p className="text-sm text-gray-400">
                {t(`groupMembersList.role.${member.role.toLowerCase()}`, member.role)}
              </p>
            </div>
            {isAdmin && (
              <button
                className="ml-auto px-3 py-1 cursor-pointer bg-emerald-700 hover:bg-emerald-800 rounded text-white text-xs"
                onClick={() => handleManageClick(member)}
              >
                {t("groupMembersList.manage", "Manage")}
              </button>
            )}
            
            {(member.profile_id === currentUserId && !isAdmin) && (
              <button
                className="ml-auto px-3 py-1 cursor-pointer bg-red-700 hover:bg-red-800 rounded text-white text-xs"
                onClick={() => handleRemoveClick(member.profile_id)}
              >
                {t("createProfileGroup.leaveGroup", "Leave Group")}
              </button>
            )}
          </li>
        ))}
      </ul>
      {/* Modal to manage the members of the group*/}
      {isAdmin && manageOpen && manageMember && 
      <ManageMembersModal 
        manageMember={manageMember}
        register={register}
        errors={errors}
        currentUserId={currentUserId}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        handleCloseManage={handleCloseManage}
        handleRemoveClick={handleRemoveClick}
        t={t}
      />
      }
      <ConfirmDialog
        isOpen={confirmOpen}
        title={pendingRemoveId === currentUserId
          ? t("createProfileGroup.leaveGroup", "Leave Group")
          : t("groupMembersList.removeMember", "Remove")}
        message={pendingRemoveId === currentUserId
          ? t("createProfileGroup.confirmLeave", "Are you sure you want to leave this group?")
          : t("createProfileGroup.confirmRemove", "Are you sure you want to remove this member?")}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        confirmLabel={pendingRemoveId === currentUserId
          ? t("createProfileGroup.leaveGroup", "Leave Group")
          : t("groupMembersList.removeMember", "Remove")}
        cancelLabel={t("createProfileGroup.cancel", "Cancel")}
        color={"error"}
      />
    </>
  );
};

export default GroupMembersList;