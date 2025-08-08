import { useEffect } from "react";
import { useForm } from "react-hook-form";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select, { Option } from "@/components/ui/Select";
import Toggle from "@/components/ui/Toggle";

import type { AdminRole } from "@/context/admin/adminRolesActions";
import { useTranslation } from "react-i18next";

const allPermissions = [
  "manage_users",
  "ban_users",
  "review_reports",
  "view_feedback",
  "access_logs",
  "edit_roles",
];

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "auditor", label: "Auditor" },
];

interface RoleFormProps {
  profileId: string | null;
  onClose: () => void;
  onSubmit: (data: Partial<AdminRole>) => Promise<void>;
  initialData?: AdminRole | null;
}

interface FormData {
  profile_id: string;
  role: string;
  permissions: Record<string, boolean>;
}

const RoleForm = ({ profileId, onClose, onSubmit, initialData }: RoleFormProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "roles.form" });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (initialData) {
      setValue("profile_id", initialData.profile_id);
      setValue("role", initialData.role);

      const permissionsMap = initialData.permissions.reduce((acc, perm) => {
        acc[perm] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setValue("permissions", permissionsMap);
    } else if (profileId) {
      setValue("profile_id", profileId);
    }
  }, [initialData, profileId, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    const activePermissions = Object.entries(data.permissions || {})
      .filter(([, value]) => value === true)
      .map(([key]) => key);

    await onSubmit({
      profile_id: data.profile_id,
      role: data.role,
      permissions: activePermissions,
    });

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-zinc-800 p-6 rounded-lg shadow max-w-lg mx-auto overflow-y-auto max-h-130"
    >
      <h2 className="text-lg font-semibold text-white text-center mb-2">
        {profileId ? t("title.edit") : t("title.add")}
      </h2>

      <Input
        id="profile_id"
        label={t("fields.profile_id.label")}
        placeholder={t("fields.profile_id.placeholder")}
        register={register}
        validation={{ required: t("fields.profile_id.required") }}
        error={errors.profile_id}
        classForLabel="text-gray-300"
        disabled={!!profileId}
      />

      <Select
        id="role"
        label={t("fields.role.label")}
        options={roleOptions.map((opt) => ({
          ...opt,
          label: t(`fields.role.options.${opt.value}`),
        }))}
        control={control}
        validation={{ required: t("fields.role.required") }}
        error={errors.role}
        search={false}
      />

      <fieldset className="space-y-2">
        <legend className="text-gray-300 font-medium mb-2">
          {t("fields.permissions.label")}
        </legend>

        {allPermissions.map((permission) => (
          <Toggle
            key={permission}
            id={`permissions.${permission}`}
            label={t(`fields.permissions.options.${permission}`)}
            register={register}
          />
        ))}
      </fieldset>

      <div className="flex gap-4 justify-center">
        <Button
          type="button"
          onClick={onClose}
          className="!bg-gray-600 hover:!bg-gray-700"
        >
          {t("buttons.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          {isSubmitting ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
