import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../../supabase";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ErrorMessage from "../../utils/ErrorMessage";
import { useTranslation } from "react-i18next";

const ForgotPasswordForm = () => {
  const { t } = useTranslation("auth", { keyPrefix: "forgotPassword" })
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState(null);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { email: "" },
  });

  // submit 
  const onSubmit = async ({ email }) => {
    setServerError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setServerError(error.message);
    else {
      setSent(true);
      reset(); // clear the input
    }
  };

  // success state
  if (sent) {
    return (
      <p className="text-center text-emerald-500">
        {t("success")}
      </p>
    );
  }

  // form 
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto space-y-4 bg-gray-900 p-6 rounded-md"
    >
      <h1 className="text-xl font-bold text-center text-gray-100">
        {t("title")}
      </h1>

      <Input
        id="email"
        type="email"
        label={t("email.label")}
        placeholder={t("email.placeholder")}
        register={register}
        validation={{
          required: t("errors.emailRequired"),
          pattern: {
            value:
              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t("errors.emailInvalid"),
          },
        }}
        error={errors.email}
      />

      {serverError && <ErrorMessage error={serverError}/>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="!w-full"
      >
        {isSubmitting ? t("button.loading") : t("button.default")}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
