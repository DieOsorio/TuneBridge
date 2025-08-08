import { useState } from "react";
import { useTranslation } from "react-i18next";

import ListSkeleton from "../skeletons/ListSkeleton";
import ErrorMessage from "@/utils/ErrorMessage";
import LogDetailView from "./LogsDetailView";
import Modal from "@/components/ui/Modal";

import type { AdminLog } from "@/context/admin/adminLogsActions";

interface AdminLogsListProps {
  logs: AdminLog[];
  hasAccess: boolean;
  isLoading: boolean;
  error: unknown;
}

const AdminLogsList = ({ 
  logs,
  hasAccess,
  isLoading,
  error, 
}: AdminLogsListProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "logs.list" });
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (log: AdminLog) => {
    setSelectedLog(log);
  };

  if (logs.length === 0) {
    return <p className="text-sm text-muted">{t("empty")}</p>;
  }
  if (isLoading) return <ListSkeleton count={3} />;
  if (error && error instanceof Error) return <ErrorMessage error={error.message} />;

  const handleCloseLog = () => {
    setSelectedLog(null);
    setShowModal(false);
  };
  return (
    <div className="overflow-x-auto rounded-md border border-gray-700 bg-zinc-900 p-4 max-h-[400px] overflow-y-auto">
      <table className="w-full text-center text-sm text-gray-300 border-separate border-spacing-0">
        <thead className="text-gray-400 bg-gray-700">
          <tr className="text-white uppercase">
            <th className="px-3 py-2 border border-gray-600">{t("fields.date")}</th>
            <th className="px-3 py-2 border border-gray-600">{t("fields.adminId")}</th>
            <th className="px-3 py-2 border border-gray-600">{t("fields.action")}</th>
            <th className="px-3 py-2 border border-gray-600">{t("fields.target")}</th>
            <th className="px-3 py-2 border border-gray-600">{t("fields.targetId")}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-800 cursor-pointer transition-all"
              onClick={() => handleRowClick(log)}
            >
              <td className="px-3 py-2 border border-gray-600 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </td>
              <td className="px-3 py-2 border border-gray-600 break-words max-w-xs">
                {log.profile_id}
              </td>
              <td className="px-3 py-2 border border-gray-600">
                {log.action_type}
              </td>
              <td className="px-3 py-2 border border-gray-600">
                {log.target_table ?? "-"}
              </td>
              <td className="px-3 py-2 border border-gray-600 break-words max-w-xs">
                {log.target_id ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     {selectedLog && (
        <Modal onClose={handleCloseLog}>
          <LogDetailView 
            log={selectedLog} 
            hasAccess={hasAccess} 
          />
        </Modal> 
      )}
    </div>
  );
};

export default AdminLogsList;
