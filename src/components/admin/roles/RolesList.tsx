import { useState } from "react";
import { useTranslation } from "react-i18next";

import { 
  TrashIcon, 
  PencilIcon 
} from "@heroicons/react/24/solid";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ListSkeleton from "../skeletons/ListSkeleton";
import ErrorMessage from "@/utils/ErrorMessage";

import type { AdminRole } from "@/context/admin/adminRolesActions";

interface RolesListProps {
  roles: AdminRole[];
  isLoading: boolean;
  error: unknown;
  onEdit: (profileId: string) => void;
  onDelete: (params: { profile_id: string }) => void;
  isAdmin?: boolean;
}

const RolesList = ({ roles, isLoading, error, onEdit, onDelete, isAdmin }: RolesListProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "roles.list" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);

  if (isLoading) {
    return <ListSkeleton count={3}/>
  }

  if (error && error instanceof Error) {
    return <ErrorMessage error={error.message} />;
  }

  if (!roles.length) {
    return <p className="text-sm text-muted">{t("noRoles")}</p>;
  }

  const handleDeleteRole = () => {
    if (selectedRole) {
      onDelete({ profile_id: selectedRole.profile_id });
      setDialogOpen(false);
      setSelectedRole(null);
    }
  };

  return (
    <>
      <ul className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
        {roles.map((role) => (
          <li
            key={role.profile_id}
            className={`flex justify-between bg-zinc-700/10 items-center p-3 rounded transition-all 
              ${isAdmin ? "cursor-pointer hover:bg-zinc-700/20" : "cursor-default"}`}
            onClick={isAdmin ? () => onEdit(role.profile_id) : undefined}
            role={isAdmin ? "button" : undefined}
            tabIndex={isAdmin ? 0 : -1}
            onKeyDown={isAdmin ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onEdit(role.profile_id);
              }
            } : undefined}
          >
            <div className="w-full">
              <p className="font-medium p-1 uppercase">{role.role}</p>
              <div className="flex items-center gap-4 w-full max-w-169 bg-gray-700 p-2 rounded-md">
                <p className="uppercase">
                  {t("permissions")}
                </p>
                <span className="text-sm text-gray-300 truncate">{role.permissions.join(", ") || t("noPermissions")}</span>
              </div>
            </div>

            {isAdmin && (
              <div className="mb-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRole(role);
                    setDialogOpen(true);
                  }}
                  className="p-1 cursor-pointer text-rose-500 hover:text-rose-700"
                  title={t("buttons.delete")}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={dialogOpen}
        title={t("danger.title")}
        message={t("danger.confirm")}
        onConfirm={handleDeleteRole}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedRole(null);
        }}
        confirmLabel={t("danger.yesDelete")}
        cancelLabel={t("danger.cancel")}
        color="error"
      />
    </>
  );
};

export default RolesList;
