import { useAdminLogs } from "@/context/admin/AdminLogsContext";
import AdminLogsList from "./AdminLogsList";
import Button from "@/components/ui/Button";
import { useTranslation } from "react-i18next";

interface LogsSectionProps {
  isAdmin: boolean;
  isModerator: boolean;
}
const LogsSection = ({
  isAdmin,
  isModerator
}: LogsSectionProps) => {
  const { t } = useTranslation("admin", {keyPrefix: "logs.section" });
  const { allAdminLogs } = useAdminLogs();
  const { data: logs = [], isLoading, error, refetch } = allAdminLogs();

  const hasAccess = isAdmin || isModerator;
  const handleRefresh = () => {
    refetch();
  };

  return (
    <section className="p-4 space-y-4">
      <header className="flex p-4 rounded-l-md justify-between items-center space-x-2 bg-gradient-to-r from-gray-800">
        <h2 className="text-xl font-semibold">
          {t("title")}
        </h2>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? t("buttons.loading") : t("buttons.refresh")}
        </Button>
      </header>

      <AdminLogsList logs={logs} hasAccess={hasAccess} error={error} isLoading={isLoading} />
    </section>
  );
};

export default LogsSection;
