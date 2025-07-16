import { useState, useCallback } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import RoleDataEditor from "./RoleDataEditor";
import { useRoles } from "../../context/music/RolesContext";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";
import Select from "../ui/Select";
import { useTranslation } from "react-i18next";
import React from "react";

interface MusicSettingsProps {
  profileId: string;
}

interface MusicSettingsForm {
  selectedRole: string;
}

const MusicSettings: React.FC<MusicSettingsProps> = ({ profileId }) => {
  const { t } = useTranslation("music");
  const { fetchRoles, addRole, deleteRole } = useRoles();
  const { data: roles = [], isLoading, isError, error } = fetchRoles(profileId);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<MusicSettingsForm>({
    defaultValues: {
      selectedRole: "",
    },
  });

  const selectedRole = watch("selectedRole");

  const onSubmit = (data: MusicSettingsForm) => {
    const roleName = data.selectedRole;
    if (roles.length >= 6) {
      setError("selectedRole", { message: t("edit.errors.maxRoles") });
      return;
    }
    if (!roleName) {
      setError("selectedRole", { message: t("edit.errors.empty") });
      return;
    }
    const isDuplicate = roles.some(
      (role: any) => role.role.toLowerCase() === roleName.toLowerCase()
    );
    if (isDuplicate) {
      setError("selectedRole", { message: t("edit.errors.duplicate") });
      return;
    }
    addRole({ profileId, roleName })
      .then(() => {
        reset();
      })
      .catch(() => {
        setError("selectedRole", {
          message: t("edit.errors.addError"),
        });
      });
  };

  const handleRoleClick = useCallback((roleId: string) => {
    setExpandedRole((prev) => (prev === roleId ? null : roleId));
  }, []);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorMessage error={error?.message ?? "Unknown error"} />;

  return (
    <div className="p-6 bg-gradient-to-r from-gray-900 text-white rounded-b-2xl shadow-lg max-w-4xl mx-auto">
      {/* Add New Role */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4">
        <h2 className="text-2xl text-yellow-600 font-semibold text-center mb-4">
          {t("edit.addRoleTitle")}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          <Select
            id="selectedRole"
            label={t("edit.selectLabel")}
            options={[
              { value: "Composer", label: t("roles.composer") },
              { value: "DJ", label: t("roles.dj") },
              { value: "Instrumentalist", label: t("roles.instrumentalist") },
              { value: "Producer", label: t("roles.producer") },
              { value: "Singer", label: t("roles.singer") },
            ]}
            className=""
            control={undefined as any}
            // The Select component should be refactored to support register for non-form controlled usage
          />
          <div className={`${selectedRole === "Other" ? "md:col-span-2" : ""}`}>
            <Button type="submit" className="w-full md:w-auto md:mt-3 !bg-emerald-600 hover:!bg-emerald-700">
              {t("edit.addButton")}
            </Button>
          </div>
        </div>
      </form>
      {/* Roles List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          {t("edit.yourRoles")}
        </h3>
        {roles.length === 0 ? (
          <p className="text-gray-300">{t("edit.noRoles")}</p>
        ) : (
          <div className="space-y-4">
            {roles.map((role: any) => (
              <div key={role.id} className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm transition-all">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700 rounded-t-lg"
                  onClick={() => handleRoleClick(role.id)}
                >
                  <span className="text-lg font-semibold text-white">
                    {t(`roles.${role.role.toLowerCase()}`)}
                  </span>
                  <div className="flex items-center gap-2">
                    <FaChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedRole === role.id ? "rotate-90" : ""}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRole({ id: role.id, profileId: profileId });
                      }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded-full hover:bg-red-600"
                      aria-label={t("music.edit.deleteRoleAria", { role: role.role })}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {expandedRole === role.id && (
                  <div className="bg-gray-900 border-t border-gray-700 px-4 py-4 rounded-b-lg">
                    <RoleDataEditor role={role} profileId={profileId} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicSettings;
