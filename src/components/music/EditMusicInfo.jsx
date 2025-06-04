import { useState, useCallback } from "react";
import { FaChevronRight } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Input from "../ui/Input";
import Button from "../ui/Button";
import RoleDataEditor from "./RoleDataEditor";
import { useRoles } from "../../context/music/RolesContext";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";
import Select from "../ui/Select";
import { useTranslation } from "react-i18next";

const EditMusicInfo = ({ profileId }) => {
  const { t } = useTranslation("music")
  const { fetchRoles } = useRoles();
  const { data: roles = [], isLoading, isError } = fetchRoles(profileId);
  const { addRole, deleteRole } = useRoles();
  const [expandedRole, setExpandedRole] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm({
    defaultValues: {
      selectedRole: "",
      // customRole: ""
    }
  });

  const selectedRole = watch("selectedRole");

  const onSubmit = (data) => {
    // const roleName = data.selectedRole === "Other" ? data.customRole.trim() : data.selectedRole;
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
      (role) => role.role.toLowerCase() === roleName.toLowerCase()
    );
    if (isDuplicate) {
      setError("selectedRole", { message: t("edit.errors.duplicate") });
      return;
    }

    addRole({ profileId, roleName })
      .then(() => {
        reset(); // Clear form fields
      })
      .catch(() => {
        setError("selectedRole", {
          message: t("edit.errors.addError")
        });
      });
  };

  const handleRoleClick = useCallback((roleId) => {
    setExpandedRole((prev) => (prev === roleId ? null : roleId));
  }, []);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorMessage error={isError.message} />;

  return (
    <div className="p-6 bg-gradient-to-r  from-gray-900 text-white rounded-b-2xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl text-center font-bold mb-4">
        {t("edit.title")}
      </h2>

      {/* Add New Role */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 space-y-4">
        <h3 className="text-xl font-semibold text-white">
          {t("edit.addRoleTitle")}
        </h3>

        <div className="grid md:grid-cols-2 gap-4 items-center">
          <Select
            id="selectedRole"
            label={t("edit.selectLabel")}
            register={register}
            validation={{ required: t("edit.errors.requiredSelect") }}
            error={errors.selectedRole}
            defaultOption={t("edit.defaultOption")}
            options={[
              { value: "Composer", label: t("roles.composer") },
              { value: "DJ", label: t("roles.dj") },
              { value: "Instrumentalist", label: t("roles.instrumentalist") },
              { value: "Producer", label: t("roles.producer") },
              { value: "Singer", label: t("roles.singer") }
              // { value: "Other", label: t("roles.custom") }
            ]}

          />

          {/* {selectedRole === "Other" && (
            <Input
              id="customRole"
              label={t("edit.customLabel")}
              placeholder={t("edit.customPlaceholder")}
              register={register}
              validation={{ required: t("edit.errors.requiredCustom") }}
              error={errors.customRole}
              classForLabel="!text-gray-700"
            />
          )} */}

          <div className={`${selectedRole === "Other" ? "md:col-span-2" : ""}`}>
            <Button type="submit" className="w-full md:w-auto md:mt-3">
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
          <p className="text-gray-300">
            {t("edit.noRoles")}
          </p>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-gray-800 rounded-lg border border-gray-700 shadow-sm transition-all"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700 rounded-t-lg"
                  onClick={() => handleRoleClick(role.id)}
                >
                  <span className="text-lg font-semibold text-white">
                    {t(`roles.${role.role.toLowerCase()}`)}
                  </span>

                  <div className="flex items-center gap-2">
                    <FaChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedRole === role.id ? "rotate-90" : ""
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRole(role.id);
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

export default EditMusicInfo;
