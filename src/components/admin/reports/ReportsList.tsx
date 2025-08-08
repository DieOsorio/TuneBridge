import { useTranslation } from "react-i18next";

import { TrashIcon } from "@heroicons/react/24/solid";

import ListSkeleton from "../skeletons/ListSkeleton";
import ErrorMessage from "@/utils/ErrorMessage";

import type { UserReport } from "@/context/admin/adminReportsActions";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useState } from "react";

interface ReportsListProps {
  reports: UserReport[];
  isLoading: boolean;
  hasAccess: boolean;
  error: unknown;
  onSelect: (reportId: string) => void;
  onDelete: (reportId: string) => void;
}

const ReportsList = ({ 
  reports,
  hasAccess,
  onSelect, 
  onDelete, 
  isLoading, 
  error }: ReportsListProps) => {
    const { t } = useTranslation("admin", { keyPrefix: "reports.list" });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);    

    if (isLoading) {
      return <ListSkeleton count={3}/>
    }

    if (error && error instanceof Error) {
      return <ErrorMessage error={error.message} />;
    }

    if (reports.length === 0) {
      return <p className="text-sm text-muted">{t("empty")}</p>;
    }

    const handleDeleteReport = () => {
      if (selectedReport) {
        onDelete(selectedReport.id);
        setDialogOpen(false);
        setSelectedReport(null);
      }
    };

    return (
      <>
        <ul className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
          {reports.map((report) => (
            <li
              key={report.id}
              className={`flex justify-between bg-zinc-700/10 items-center p-3 rounded transition-all 
                ${hasAccess ? "cursor-pointer hover:bg-zinc-700/20" : "cursor-default"}`}
              onClick={hasAccess ? () => onSelect(report.id) : undefined}
              role={hasAccess ? "button" : undefined}
              tabIndex={hasAccess ? 0 : -1}
              onKeyDown={hasAccess ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelect(report.id);
                }
              } : undefined}
            >
              <div className="flex flex-col flex-grow gap-1">
                <p className="font-semibold text-gray-300 text-sm truncate w-full bg-gray-700 px-2 py-3 rounded-md max-w-169">{report.reason}</p>
                <div className="flex items-center gap-4 w-full bg-gray-700 p-2 rounded-md max-w-169">
                  <p className="uppercase">
                    {t("target")}
                  </p>
                  <span className="text-sm text-gray-300">{report.target_type}</span>
                </div>
                <div className="flex items-center gap-4 w-full bg-gray-700 p-2 rounded-md max-w-169">
                  <p className="uppercase">
                    {t("status")}
                  </p>
                  <span className="text-sm text-gray-300">{report.status}</span>
                </div>
              </div>

              {hasAccess && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                    setDialogOpen(true);
                  }}
                  aria-label={t("deleteAria")}
                  title={t("deleteTitle")}
                  className="p-1 mb-auto text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </li>
          ))}
        </ul>
        <ConfirmDialog
          isOpen={dialogOpen}
          title={t("danger.title")}
          message={t("danger.confirm")}
          onConfirm={handleDeleteReport}
          onCancel={() => {
            setDialogOpen(false);
            setSelectedReport(null);
          }}
          confirmLabel={t("danger.yesDelete")}
          cancelLabel={t("danger.cancel")}
          color="error"
        />
      </>
    );
};

export default ReportsList;
