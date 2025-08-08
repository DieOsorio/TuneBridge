import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { UserReport } from "@/context/admin/adminReportsActions";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

interface ReportDetailModalProps {
  report: UserReport;
  onClose: () => void;
  onUpdate: (data: Partial<UserReport>) => Promise<void>;
}

const ReportDetailModal = ({ report, onClose, onUpdate }: ReportDetailModalProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "reports.reportDetail" });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Partial<UserReport>>({
    defaultValues: {
      status: report.status,
      notes: report.notes ?? "",
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: Partial<UserReport>) => {
    setIsSaving(true);
    try {
      await onUpdate({ id: report.id, ...data });
      onClose();
    } catch (error) {
      console.error("Failed to update report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-zinc-900 p-6 rounded-lg max-w-lg w-full space-y-4 overflow-y-auto max-h-130"
    >
      <h3 className="text-xl text-center font-semibold text-white">
        {t("title")}
      </h3>

      <div className="text-gray-300 space-y-4 text-sm mb-10 border border-gray-600 bg-gray-800 p-4 rounded-lg">
        <p>
          <strong className="mr-2">{t("fields.reporterId")}:</strong>
          <Link
            to={`/profile/${report.reporter_id}`}
            className="hover:text-blue-400 hover:underline transition-all"
          >
            {report.reporter_id}
          </Link>
        </p>
        <p>
          <strong className="mr-2">{t("fields.target")}:</strong>{report.target_type} — {report.target_id}
        </p>
        <p>
          <strong className="mr-2">{t("fields.targetOwner")}:</strong>
          <Link 
            to={`/profile/${report.target_owner_id}`}
            className="hover:text-blue-400 hover:underline transition-all"
          >
            {report.target_owner_id}
          </Link>
        </p>
        <p>
          <strong className="mr-2">{t("fields.reason")}:</strong> {report.reason}
        </p>
        <p>
          <strong className="mr-2">{t("fields.createdAt")}:</strong> {new Date(report.created_at).toLocaleString()}
        </p>
      </div>

      <Select
        id="status"
        label={t("fields.status")}
        control={control}
        options={[
          { value: "pending", label: t("statusOptions.pending") },
          { value: "reviewing", label: t("statusOptions.reviewing") },
          { value: "resolved", label: t("statusOptions.resolved") }
        ]}
        search={false}
      />

      <Textarea
        id="notes"
        label={t("fields.notes")}
        placeholder={t("placeholders.notes")}
        maxLength={1000}
        watchValue={watch("notes") ?? undefined}
        register={register}
        error={errors.notes}
      />

      <div className="flex justify-center gap-4">
        <Button
          type="button"
          onClick={onClose}
          className="!bg-gray-600 hover:!bg-gray-700"
          disabled={isSaving}
        >
          {t("buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </div>
    </form>
  );
};

export default ReportDetailModal;
