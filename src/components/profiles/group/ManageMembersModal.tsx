import { FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { 
  FieldErrors, 
  UseFormRegister, 
  UseFormWatch, 
  UseFormSetValue, 
  SubmitHandler, 
  UseFormHandleSubmit,
  UseControllerProps,
  Controller
} from "react-hook-form";

interface FormInputs {
  editMemberRole: string;
  newBandRole: string;
}

interface ManageMembersModalProps {
  manageMember: { profile_id: string };
  register: UseFormRegister<FormInputs>;
  control: UseControllerProps<FormInputs>['control'];
  errors: FieldErrors<FormInputs>;
  currentUserId: string;
  handleSubmit: UseFormHandleSubmit<FormInputs>;
  onSubmit: SubmitHandler<FormInputs>;
  handleCloseManage: () => void;
  handleRemoveClick: (profileId: string) => void;
  watch: UseFormWatch<FormInputs>;
  setValue: UseFormSetValue<FormInputs>;
  customRoles: string[];
  setCustomRoles: (roles: string[]) => void;
}

function ManageMembersModal({
  manageMember,
  register,
  errors,
  currentUserId,
  handleSubmit,
  onSubmit,
  handleCloseManage,
  handleRemoveClick,
  watch,
  control,
  setValue,
  customRoles,
  setCustomRoles,
}: ManageMembersModalProps) {
  const { t } = useTranslation("profileGroup");
  const newRole = watch("newBandRole")?.trim();


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 gap-8 rounded-lg shadow-lg p-6 w-full max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Main Role */}
          <Controller
            name="editMemberRole"
            control={control}
            render={({ field }) => (
              <Select
                id="editMemberRole"
                control={control}
                label={t("manageMembers.labels.role")}
                options={[
                { value: "member", label: t("manageMembers.labels.member") },
                { value: "admin", label: t("manageMembers.labels.admin") },
                { value: "musician", label: t("manageMembers.labels.musician") },
                { value: "manager", label: t("manageMembers.labels.manager") },
              ]}
                error={errors.editMemberRole}
              />
            )}
          />

          {/* Custom Roles */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Input
                id="newBandRole"
                label={t("groupMembers.labels.bandRole")}
                maxLength={12}
                placeholder={t("groupMembers.placeholders.bandRole")}
                register={register}
                error={errors.newBandRole}
                className="!flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    newRole &&
                    !customRoles.includes(newRole) &&
                    customRoles.length < 3
                  ) {
                    setCustomRoles([...customRoles, newRole]);
                    setValue("newBandRole", "");
                  }
                }}
                disabled={!newRole || customRoles.length >= 3}
                className="text-emerald-500 hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiPlus size={22} />
              </button>
            </div>
            {errors.newBandRole && (
              <span className="text-red-500 text-sm">
                {errors.newBandRole.message}
              </span>
            )}

            {customRoles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customRoles.map((role, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-sm rounded bg-emerald-800 text-white flex items-center gap-2"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() =>
                        setCustomRoles(customRoles.filter((r) => r !== role))
                      }
                      className="text-red-400 hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4 mt-6">
            <Button
              className="!bg-emerald-600 hover:!bg-emerald-700"
              type="submit"
            >
              {t("manageMembers.buttons.save")}
            </Button>
            <Button
              className="!bg-gray-600 hover:!bg-gray-700"
              onClick={handleCloseManage}
              type="button"
            >
              {t("manageMembers.buttons.cancel")}
            </Button>
          </div>
        </form>

        {/* Remove/Leave Button */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <button
            className="w-full px-3 py-2 bg-red-700 hover:bg-red-800 rounded text-white text-xs"
            onClick={() => {
              handleRemoveClick(manageMember.profile_id);
              handleCloseManage();
            }}
          >
            {manageMember.profile_id === currentUserId
              ? t("manageMembers.buttons.leaveGroup")
              : t("manageMembers.buttons.removeMember")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageMembersModal;
