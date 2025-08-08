import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import ListSkeleton from "../skeletons/ListSkeleton";
import ErrorMessage from "@/utils/ErrorMessage";

import type { BannedUser } from "@/context/admin/bannedUsersActions";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { ba } from "node_modules/@fullcalendar/core/internal-common";

interface BanListProps {
  bannedUsers: BannedUser[];
  onSelect: (profileId: string) => void;
  hasAccess: boolean;
  isLoading: boolean;
  error: unknown;
}

const BanList = ({
  bannedUsers,
  isLoading,
  hasAccess,
  error,
  onSelect,
}: BanListProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "bans.list" });

  if (isLoading) return <ListSkeleton count={3} />;
  if (error && error instanceof Error) return <ErrorMessage error={error.message} />;
  if (bannedUsers.length === 0)
    return <p className="text-sm text-muted">{t("empty")}</p>;

  return (
    <div className="space-y-4">
      {bannedUsers.map((ban) => (
        <div
          key={ban.profile_id}
          className={`flex justify-between bg-zinc-700/10 items-center p-3 rounded transition-all 
              ${hasAccess ? "cursor-pointer hover:bg-zinc-700/20" : "cursor-default"}`}
          onClick={hasAccess ? () => onSelect(ban.profile_id) : undefined}
          role={hasAccess ? "button" : undefined}
          tabIndex={hasAccess ? 0 : -1}
          onKeyDown={hasAccess ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(ban.profile_id);
              }
            } : undefined}
        >
          <div className="flex flex-col gap-1 items-start flex-grow min-w-0">
            <div className="space-x-2 w-full bg-gray-700 p-2 rounded-md">
              <span className="uppercase">{t("profileId")}</span>
              <span className="text-sm text-gray-300">{ban.profile_id}</span>
            </div>

            <div className="space-x-2 w-full bg-gray-700 p-2 rounded-md">
              <span className="uppercase">{t("until")}</span>
              <span className="text-sm text-gray-300">
                {ban.banned_until
                  ? format(new Date(ban.banned_until), "PPpp")
                  : t("permanent")}
              </span>
            </div>
          </div>

          <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
};

export default BanList;
