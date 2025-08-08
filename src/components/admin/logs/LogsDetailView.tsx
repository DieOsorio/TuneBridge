import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Link } from "react-router-dom";

import type { AdminLog } from "@/context/admin/adminLogsActions";

interface LogDetails {
  type?: string;
  reason?: string;
  banned_by?: string;
  handled_by?: string | null;
  created_at?: unknown;
  banned_until?: unknown;
  [key: string]: unknown;
}

interface LogDetailViewProps {
  log: AdminLog | null;
  hasAccess: boolean;
}

const formatDateIfValid = (date: unknown) => {
  if (typeof date === "string" || typeof date === "number") {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return format(d, "PPpp");
    }
  }
  return "-";
};

const LogDetailView = ({ log, hasAccess }: LogDetailViewProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "logs.details" });

  if (!log) {
    return (
      <div className="text-center text-muted text-sm">
        {t("selectLog", "Select a log from the list to see details")}
      </div>
    );
  }

  const details = log.details as LogDetails;

  return (
    <div className="space-y-6 text-center bg-zinc-800 p-6 rounded-lg shadow max-w-lg mx-auto overflow-y-auto max-h-[400px] text-white">
      {/* Log basic info */}
      <div>
        <h2 className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold">
          {t("logId")}
        </h2>
        <p className="text-sm break-all text-gray-300">{log.id}</p>
      </div>

      <div>
        <h2 className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold">
          {t("profileId")}
        </h2>
        <p className="text-sm break-all text-gray-300 hover:text-sky-500 hover:underline transition-all">
          <Link to={`/profile/${log.profile_id}`}>{log.profile_id}</Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">
            {t("actionType")}
          </h2>
          <p className="text-sm break-all text-gray-300">{log.action_type}</p>
        </div>
        <div>
          <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">
            {t("targetTable")}
          </h2>
          <p className="text-sm break-all text-gray-300">{log.target_table ?? "-"}</p>
        </div>
        <div>
          <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">
            {t("targetId")}
          </h2>
          <p className="text-sm break-all text-gray-300">{log.target_id ?? "-"}</p>
        </div>
        <div>
          <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">
            {t("createdAt")}
          </h2>
          <p className="text-sm break-all text-gray-300">{formatDateIfValid(log.created_at)}</p>
        </div>
      </div>

      {/* Details section */}
      <div>
        <h2 className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold">
          {t("details")}
        </h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {"type" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.type")}</h3>
              <p className="text-sm break-all text-gray-300">{details.type}</p>
            </div>
          )}
          {"reason" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.reason")}</h3>
              <p className="text-sm break-all text-gray-300">{details.reason}</p>
            </div>
          )}
          {"banned_by" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.bannedBy")}</h3>
              <Link to={`/profile/${details.banned_by}`} className="text-sm break-all text-gray-300 hover:text-sky-500 hover:underline transition-all">
                {details.banned_by}
              </Link>
            </div>
          )}
          {"handled_by" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.handledBy")}</h3>
              <p className="text-sm break-all text-gray-300">{details.handled_by ?? t("details.notHandled")}</p>
            </div>
          )}
          {"created_at" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.createdAt")}</h3>
              <p className="text-sm break-all text-gray-300">{formatDateIfValid(details.created_at)}</p>
            </div>
          )}
          {"banned_until" in details && (
            <div>
              <h3 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("details.bannedUntil")}</h3>
              <p className="text-sm break-all text-gray-300">
                {details.banned_until
                  ? formatDateIfValid(details.banned_until)
                  : t("details.permanent")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogDetailView;
