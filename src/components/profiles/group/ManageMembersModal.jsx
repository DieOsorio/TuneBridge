import Button from "../../ui/Button";
import Select from "../../ui/Select";

function ManageMembersModal({ 
  manageMember, 
  register, 
  errors,
  currentUserId, 
  handleSubmit, 
  onSubmit, 
  handleCloseManage, 
  handleRemoveClick,
  t
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">                  
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <Select
              id="editMemberRole"
              label={t("createProfileGroup.role", "Role")}
              options={[
                { value: "member", label: t("createProfileGroup.member", "Member") },
                { value: "admin", label: t("createProfileGroup.admin", "Admin") },
                { value: "musician", label: t("createProfileGroup.musician", "Musician") },
                { value: "manager", label: t("createProfileGroup.manager", "Manager") },
              ]}
              register={register}
              validation={{ required: t("createProfileGroup.roleRequired", "Role is required") }}
              error={errors.editMemberRole}
              classForLabel="text-gray-200"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <Button
              className="!bg-emerald-700 hover:!bg-emerald-800"
              type="submit"
            >
              {t("createProfileGroup.save", "Save")}
            </Button>
            <Button
              className="!bg-gray-500 hover:!bg-gray-600"
              onClick={handleCloseManage}
              type="button"
            >
              {t("createProfileGroup.cancel", "Cancel")}
            </Button>
          </div>
        </form>
        <div className="border-t border-gray-700 pt-4 mt-4">
          <button
            className="w-full px-3 py-2 bg-red-700 hover:bg-red-800 rounded text-white text-xs"
            onClick={() => { handleRemoveClick(manageMember.profile_id); handleCloseManage(); }}
          >
            {manageMember.profile_id === currentUserId
              ? t("createProfileGroup.leaveGroup", "Leave Group")
              : t("groupMembersList.removeMember", "Remove")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManageMembersModal