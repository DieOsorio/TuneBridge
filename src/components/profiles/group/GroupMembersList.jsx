import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ProfileAvatar from "../ProfileAvatar";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import ConfirmDialog from "../../ui/ConfirmDialog";
import ManageMembersModal from "./ManageMembersModal";

const GroupMembersList = ({ members, isAdmin, onRemoveMember, onUpdateMember, refetch }) => {
  const { user } = useAuth(); // Get the logged-in user's info
  const { t } = useTranslation("profileGroup");
  const currentUserId = user?.id; // Get the current user's ID
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [customRoles, setCustomRoles] = useState([]);
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    reset,
    watch, 
    formState: { errors } 
  } = useForm();

  const [manageOpen, setManageOpen] = useState(false);
  const [manageMember, setManageMember] = useState(null);

  
  if (!members || members.length === 0) {
    return (
      <p className="text-gray-400">
        {t("groupMembersList.messages.members") +
          ": " +
          t("groupMembersList.messages.noMembers")}
      </p>
    );
  }

  const handleManageClick = (member) => {
    setManageMember(member);
    setManageOpen(true);
    setValue("editMemberRole", member.role); // set default value
    setCustomRoles(member.roles_in_group || [])
  };

  const onSubmit = async (data) => {    
    await onUpdateMember(
      manageMember,
      {
        role: data.editMemberRole,
        roles_in_group: customRoles
      }
    );
    setManageOpen(false);
    setManageMember(null);
    refetch();
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
                avatar_url={member?.profiles?.avatar_url || ""}
                className="!w-16 !h-16"
              />
            </Link>
            <div className="text-sm text-gray-400 flex flex-col gap-1">
              <p>
                {t(`groupMembersList.role.${member.role.toLowerCase()}`, member.role)}
              </p>

              {member.roles_in_group && member.roles_in_group.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.roles_in_group.map((r, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-800 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isAdmin && (
              <button
                className="ml-auto px-3 py-1 cursor-pointer bg-yellow-700 hover:bg-yellow-800 rounded text-white text-xs"
                onClick={() => handleManageClick(member)}
              >
                {t("groupMembersList.buttons.manage")}
              </button>
            )}
            
            {(member.profile_id === currentUserId && !isAdmin) && (
              <button
                className="ml-auto px-3 py-1 cursor-pointer bg-red-700 hover:bg-red-800 rounded text-white text-xs"
                onClick={() => handleRemoveClick(member.profile_id)}
              >
                {t("groupMembersList.buttons.leave")}
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
        watch={watch}
        setValue={setValue}
        customRoles={customRoles}
        setCustomRoles={setCustomRoles}
      />
      }
      <ConfirmDialog
        isOpen={confirmOpen}
        title={pendingRemoveId === currentUserId
          ? t("groupMembersList.confirmDialog.titles.leaveGroup",)
          : t("groupMembersList.confirmDialog.titles.removeMember")}
        message={pendingRemoveId === currentUserId
          ? t("groupMembersList.confirmDialog.messages.confirmLeave")
          : t("groupMembersList.confirmDialog.messages.confirmRemove")}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        confirmLabel={pendingRemoveId === currentUserId
          ? t("groupMembersList.confirmDialog.labels.leaveGroup")
          : t("groupMembersList.confirmDialog.labels.removeMember")}
        cancelLabel={t("groupMembersList.confirmDialog.labels.cancel")}
        color={"error"}
      />
    </>
  );
};

export default GroupMembersList;