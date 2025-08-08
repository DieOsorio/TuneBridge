import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import Button from "@/components/ui/Button";

import type { BannedUser } from "@/context/admin/bannedUsersActions";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Link } from "react-router-dom";

interface BanDetailsViewProps {
  bannedUser: BannedUser | null;
  onEdit: (profileId: string) => void;
  onDelete: (profileId: string) => void;
  hasAccess: boolean;
}

const BanDetailsView = ({
  bannedUser,
  onEdit,
  onDelete,
  hasAccess,
}: BanDetailsViewProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "bans.details" });
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!bannedUser) {
    return (
      <div className="text-center text-muted text-sm">
        {t("selectBan", "Select a ban from the list to see details")}
      </div>
    );
  }

  const handleDeleteBan = () => {
    onDelete(bannedUser.profile_id);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-8 bg-zinc-800 p-6 rounded-lg shadow max-w-lg mx-auto overflow-y-auto max-h-200">
      <div className="text-center p-2">
        <h2 className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold">{t("profileId")}</h2>
        <p className="break-all text-sm text-foreground text-gray-300 hover:text-sky-500 hover:underline transition-all">
          <Link to={`/profile/${bannedUser.profile_id}`}>
            {bannedUser.profile_id}
          </Link>
        </p>
      </div>

      <div className="text-center p-2">
        <h2 className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold">{t("reason")}</h2>
        <p className="text-sm text-gray-300 text-foreground whitespace-pre-wrap">
          {bannedUser.reason || t("noReason")}
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between gap-2 text-center p-2">
          <div className="w-1/2">
            <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("bannedAt")}</h2>
            <p className="text-sm text-gray-300">{format(new Date(bannedUser.created_at), "PPpp")}</p>
          </div>

          <div className="w-1/2">
            <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("bannedUntil")}</h2>
            <p className="text-sm text-gray-300">
              {bannedUser.banned_until
                ? format(new Date(bannedUser.banned_until), "PPpp")
                : t("permanent")}
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-2 text-center p-2">
          <div className="w-1/2">
            <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("bannedBy")}</h2>
            <p className="text-sm break-all text-gray-300 hover:text-sky-500 hover:underline transition-all">
              <Link to={`/profile/${bannedUser.banned_by}`}>
                {bannedUser.banned_by}
              </Link>
            </p>
          </div>

          <div className="w-1/2">
            <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("handledBy")}</h2>
            <p className="text-sm break-all text-gray-300">
              {bannedUser.handled_by || t("notHandled")}
            </p>
          </div>
        </div>
      </div>

      {hasAccess && (
        <div className="flex gap-4 justify-center">
          <Button
            className="!bg-yellow-600 hover:!bg-yellow-700" 
            onClick={() => onEdit(bannedUser.profile_id)}
          >
            {t("buttons.edit")}
          </Button>
          <Button
            className="!bg-rose-600 hover:!bg-rose-700"
            onClick={(e) => {
              setDialogOpen(true);
            }}
          >
            {t("buttons.delete")}
          </Button>
        </div>
      )}
      <ConfirmDialog
        isOpen={dialogOpen}
        title={t("danger.title")}
        message={t("danger.confirm")}
        onConfirm={handleDeleteBan}
        onCancel={() => {
          setDialogOpen(false);
        }}
        confirmLabel={t("danger.yesDelete")}
        cancelLabel={t("danger.cancel")}
        color="error"
      />
    </div>
  );
};

export default BanDetailsView;
