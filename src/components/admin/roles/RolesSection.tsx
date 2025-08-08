import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminRoles } from "@/context/admin/AdminRolesContext";

import RolesList from "./RolesList";
import RoleForm from "./RoleForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface RolesSectionProps {
  isAdmin: boolean,
  isModerator: boolean
}


const RolesSection = ({
  isAdmin,
  isModerator,
}: RolesSectionProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "roles.section" });
  const {
    allAdminRolesQuery,
    upsertAdminRole,
    deleteAdminRole,    
  } = useAdminRoles();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: roles, isLoading, error } = allAdminRolesQuery();

  const selectedRole = selectedProfileId
    ? roles?.find((r) => r.profile_id === selectedProfileId) ?? null
    : null;

  const handleAddNew = () => {
    setSelectedProfileId(null);
    setShowForm(true);
  };

  const handleEdit = (profileId: string) => {
    setSelectedProfileId(profileId);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setSelectedProfileId(null);
    setShowForm(false);
  };

  return (
    <section className="p-4 space-y-4">
      <header className="flex p-4 rounded-l-md justify-between items-center space-x-2 bg-gradient-to-r from-gray-800">
        <h2 className="text-xl font-semibold">
          {t("title")}
        </h2>
        {isAdmin && 
          <Button 
            onClick={handleAddNew}
            className="!bg-emerald-600 hover:!bg-emerald-700"
          >
            {t("buttons.add")}
          </Button>
        }
      </header>

      <RolesList
        roles={roles ?? []}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={deleteAdminRole}
        isAdmin={isAdmin}
      />

      {showForm && isAdmin && (
        <Modal onClose={handleCloseForm}>
          <RoleForm
          profileId={selectedProfileId}
          initialData={selectedRole}
          onClose={handleCloseForm}
          onSubmit={async (data) => {
            await upsertAdminRole(data);
          }}
        />
        </Modal>
      )}
    </section>
  );
};

export default RolesSection;
