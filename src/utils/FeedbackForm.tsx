import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useAdminFeedback } from "@/context/admin/AdminFeedbackContext";
import type { UserFeedback } from "@/context/admin/adminFeedbackActions";

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

type FeedbackFormData = {
  type: string;
  message: string;
  feedback_topic?: string | null;
};

const FeedbackForm = () => {
  const { t } = useTranslation("feedback", { keyPrefix: "form" });
  const { user } = useAuth();
  const { insertUserFeedback } = useAdminFeedback();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FeedbackFormData>({
    defaultValues: {
      type: "",
      message: "",
      feedback_topic: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user?.id) return;

    const payload: Partial<UserFeedback> = {
      profile_id: user.id,
      type: data.type,
      message: data.message,
      feedback_topic: data.feedback_topic?.trim() || null,
    };

    await insertUserFeedback(payload);
    navigate("/feedback-success");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mx-auto">
      <Select
        id="type"
        label={t("labels.type")}
        options={[
          { value: "bug", label: t("types.bug") },
          { value: "suggestion", label: t("types.suggestion") },
          { value: "other", label: t("types.other") },
        ]}
        control={control}
        error={errors.type}
        validation={{ required: t("validations.typeRequired") }}
        search={false}
        classForLabel="text-gray-400"
      />

      <Input
        id="feedback_topic"
        label={t("labels.topic")}
        placeholder={t("placeholders.topic")}
        type="text"
        register={register}
        watchValue={watch("feedback_topic") || undefined}
        maxLength={50}
        classForLabel="!text-gray-400"
        error={errors.feedback_topic}
      />

      <Textarea
        id="message"
        label={t("labels.message")}
        placeholder={t("placeholders.message")}
        register={register}
        validation={{
          required: t("validations.messageRequired"),
          maxLength: {
            value: 500,
            message: t("validations.messageMax"),
          },
        }}
        error={errors.message}
        maxLength={500}
        watchValue={watch("message")}
        classForLabel="text-gray-400"
      />

      <div className="flex justify-center gap-4">
        <Button className="!bg-emerald-600 hover:!bg-emerald-700" type="submit">
          {t("buttons.submit")}
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;
