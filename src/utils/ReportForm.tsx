import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

import { useAdminReports } from "@/context/admin/AdminReportsContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface ReportFormProps {
  targetType: string;
  targetId: string;
  targetOwnerId: string;
  title: string;
  description: string;
  onClose?: () => void;
}

interface FormData {
  reason: string;
}

const ReportForm = ({
  targetType,
  targetId,
  targetOwnerId,
  title,
  description,
  onClose,
}: ReportFormProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "reports" });
  const { insertUserReport } = useAdminReports();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (!targetType || !targetId || !targetOwnerId) {
      setFormError("Missing target information to report.");
    }
  }, [targetType, targetId, targetOwnerId]);

  const handleFormSubmit = async (data: FormData) => {
    setFormError(null);
    setFormSuccess(null);

    if (!user?.id) {
      setFormError(t("error"));
      return;
    }

    if (!targetType || !targetId || !targetOwnerId) {
      setFormError("Missing target information to report.");
      return;
    }

    try {
      await insertUserReport({
        reporter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        target_owner_id: targetOwnerId,
        reason: data.reason,
        status: "pending",
      });

      setFormSuccess(t("success"));
      reset();

      if (onClose) {
        onClose();
      } else {
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (error) {
      setFormError(t("error"));
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 bg-zinc-900 p-6 rounded-lg shadow full-width mx-auto"
    >
      {/* Title from props, fallback to i18n */}
      <h2 className="text-lg font-semibold text-white text-center mb-1">
        {title || t("title")}
      </h2>

      {/* Description from props, fallback to i18n */}
      <p className="text-sm text-gray-400 text-center mb-4">
        {description || t("description")}
      </p>

      {formError && (
        <p className="text-red-500 text-center">{formError}</p>
      )}
      {formSuccess && (
        <p className="text-green-500 text-center">{formSuccess}</p>
      )}

      <Textarea
        id="reason"
        placeholder={t("form.reason.placeholder")}
        maxLength={500}
        register={register}
        watchValue={watch("reason")}
        validation={{ required: t("form.reason.error") }}
        error={errors.reason}
      />

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={handleCancel}
          className="!bg-gray-600 hover:!bg-gray-700"
          disabled={isSubmitting}
        >
          {t("buttons.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? `${t("buttons.submit")}...` : t("buttons.submit")}
        </Button>
      </div>
    </form>
  );
};

export default ReportForm;
