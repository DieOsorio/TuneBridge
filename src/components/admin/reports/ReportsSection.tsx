import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminReports } from "@/context/admin/AdminReportsContext";

import ReportsList from "./ReportsList";
import ReportDetailModal from "./ReportDetailModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface ReportsSectionProps {
  isAdmin: boolean,
  isModerator: boolean
}

const ReportsSection = ({
  isAdmin,
  isModerator
}: ReportsSectionProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "reports.section" })
  const { allReports, updateUserReport, deleteUserReport } = useAdminReports();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const { data: reports = [], isLoading, error, refetch } = allReports();

  // Open modal for detail view
  const openReportDetail = (reportId: string) => setSelectedReportId(reportId);

  // Close modal
  const closeReportDetail = () => setSelectedReportId(null);

  const hasAccess = isAdmin || isModerator;

  // Update report handler (e.g. status, notes)
  const handleUpdateReport = async (updatedData: Partial<typeof reports[number]>) => {
    if (!updatedData.id) return;
    try {
      await updateUserReport(updatedData);
      await refetch();
      closeReportDetail();
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  // Delete report handler
  const handleDeleteReport = async (reportId: string) => {
    try {
      // Since this is admin global list, we need to find reporter_id for delete mutation
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;
      await deleteUserReport({ id: reportId, reporter_id: report.reporter_id });
      await refetch();
      if (selectedReportId === reportId) closeReportDetail();
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  return (
    <section className="p-4 space-y-4">
      <header className="flex p-4 rounded-l-md justify-between items-center space-x-2 bg-gradient-to-r from-gray-800">
        <h2 className="text-xl font-semibold">
          {t("title")}
        </h2>
        <Button onClick={() => refetch()}>
          {t("refresh")}
        </Button>
      </header>

      <ReportsList 
        reports={reports}
        isLoading={isLoading}
        error={error}
        hasAccess={hasAccess}
        onSelect={openReportDetail} 
        onDelete={handleDeleteReport} 
      />

      {selectedReportId && hasAccess && (
        <Modal onClose={closeReportDetail}>
          <ReportDetailModal
            report={reports.find((r) => r.id === selectedReportId)!}
            onClose={closeReportDetail}
            onUpdate={handleUpdateReport}
          />
        </Modal>
      )}
    </section>
  );
};

export default ReportsSection;
