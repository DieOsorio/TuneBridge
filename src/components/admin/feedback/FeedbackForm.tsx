import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

import type { UserFeedback } from "@/context/admin/adminFeedbackActions";

interface FeedbackFormProps {
  feedback: UserFeedback;
  onClose: () => void;
  onUpdate: (updatedFeedback: Partial<UserFeedback>) => Promise<void>;
}

interface FormData {
  response: string;
}

const FeedbackForm = ({
  feedback,
  onClose,
  onUpdate,
}: FeedbackFormProps) => {
  const { t } = useTranslation("admin", { keyPrefix: "feedback.form" });
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      response: feedback.response ?? "",
    },
  });

  useEffect(() => {
    reset({ response: feedback.response ?? "" });
  }, [feedback, reset]);

  const handleSave = async (data: FormData) => {
    setError(null);
    try {
      await onUpdate({
        id: feedback.id,
        response: data.response,
        status: "responded",
      });
      onClose();
    } catch {
      setError("Failed to save response. Please try again.");
    }
  };

  return (
    <div className="space-y-6 bg-zinc-900 p-6 rounded-lg shadow full-width mx-auto">
      <h2 className="text-lg font-semibold text-white text-center mb-4">
        {t("title")}
      </h2>

      <p className="text-lg bg-black/20 p-2 rounded-lg mb-2 font-semibold text-center uppercase">
        {feedback.type}
      </p>
      <p className="text-sm break-all text-center text-gray-300">
        {feedback.message}
      </p>   

      <div className="flex justify-between gap-2 text-center p-2">
        {feedback.feedback_topic && (
          <div className="w-1/2">
            <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("fields.topic")}</h2>
            <p className="text-sm break-all text-gray-300">
              {feedback.feedback_topic}
            </p>
          </div>
        )} 
        <div className="w-1/2">
          <h2 className="text-sm bg-black/20 p-2 rounded-lg mb-2 font-medium text-muted-foreground">{t("fields.status")}</h2>
          <p className="text-sm break-all text-gray-300">
            {feedback.status}
          </p>
        </div>
      </div>

      <Textarea
        id="response"
        placeholder={t("placeholders.response")}
        register={register}
        maxLength={1000}
        watchValue={watch("response")}
        validation={{ required: t("validations.response") }}
        error={errors.response}
      />

      <div className="mt-6 flex justify-center gap-4">
        <Button
          type="button"
          onClick={onClose}
          className="!bg-gray-600 hover:!bg-gray-700"
          disabled={isSubmitting}
        >
          {t("buttons.cancel")}
        </Button>
        <Button type="button" onClick={handleSubmit(handleSave)} disabled={isSubmitting}>
          {isSubmitting ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
