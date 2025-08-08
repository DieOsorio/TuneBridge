import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useBannedUsers } from "@/context/admin/BannedUsersContext";

import BanList from "./BanList";
import BanDetailsView from "./BanDetailsView";
import BanForm from "./BanForm";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface BansSectionProps {
  isAdmin: boolean;
  isModerator: boolean;
  currentAdminId: string;
}

const BansSection = ({
  isAdmin,
  isModerator,
  currentAdminId,
}: BansSectionProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "bans.section" });
  const { allBannedUsers, upsertBannedUser, deleteBannedUser } = useBannedUsers();
  const { data: bannedUsers = [], isLoading, error, refetch } = allBannedUsers();

  const hasAccess = isAdmin || isModerator;

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const openBanForm = (profileId: string | null) => {
    setEditingProfileId(profileId); // null = new ban
    setIsFormOpen(true);
  };

  const closeBanForm = () => {
    setEditingProfileId(null);
    setIsFormOpen(false);
  };
  const closeBanDetails = () => {
    setIsDetailsOpen(false);
    setSelectedProfileId(null);
  };

  const handleSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    setIsDetailsOpen(true);
  };

  const handleSaveBan = async (banData: Partial<typeof bannedUsers[number]>) => {
    try {
      await upsertBannedUser(banData);
      await refetch();
      closeBanForm();
    } catch (error) {
      console.error("Failed to save ban:", error);
    }
  };

  const handleDeleteBan = async (profileId: string) => {
    try {
      await deleteBannedUser({ profile_id: profileId });
      await refetch();
      if (editingProfileId === profileId) closeBanForm();
      if (selectedProfileId === profileId) setSelectedProfileId(null);
      closeBanDetails();
    } catch (error) {
      console.error("Failed to delete ban:", error);
    }
  };

  const selectedBan = bannedUsers.find(b => b.profile_id === selectedProfileId) ?? null;

  return (
    <section className="p-4 space-y-4">
      <header className="flex p-4 rounded-l-md justify-between items-center space-x-2 bg-gradient-to-r from-gray-800">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <div className="flex gap-4">
          <Button 
            className="!bg-emerald-600 hover:!bg-emerald-700"
            onClick={() => openBanForm(null)}
          >
            {t("buttons.add")}
          </Button>
          <Button onClick={() => refetch()}>{t("buttons.refresh")}</Button>
        </div>
      </header>

      <BanList
        bannedUsers={bannedUsers}
        onSelect={handleSelect}
        hasAccess={hasAccess}
        isLoading={isLoading}
        error={error}
      />

      {isDetailsOpen && (
        <Modal onClose={closeBanDetails}>
          <BanDetailsView
            bannedUser={selectedBan}
            onEdit={openBanForm}
            onDelete={handleDeleteBan}
            hasAccess={hasAccess}
          />
        </Modal>
      )}

      {hasAccess && isFormOpen && (
        <Modal onClose={closeBanForm}>
          <BanForm
            profileId={editingProfileId}
            initialData={
              editingProfileId
                ? bannedUsers.find(b => b.profile_id === editingProfileId) ?? null
                : null
            }
            onClose={closeBanForm}
            onSubmit={handleSaveBan}
            currentAdminId={currentAdminId}
          />
        </Modal>
      )}
    </section>
  );
};

export default BansSection;
