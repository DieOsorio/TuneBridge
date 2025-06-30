import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import Input  from "../ui/Input";
import Button from "../ui/Button";
import { useTranslation } from "react-i18next";
import ErrorMessage from "../../utils/ErrorMessage";

const ResetPasswordForm = () => {
  const { t } = useTranslation("auth", { keyPrefix: "resetPassword" })
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  // react-hook-form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password: "" },
  });

  // guard: if the redirect is opened without a recovery session
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) navigate("/login");
    })();
  }, [navigate]);

  // submit
  const onSubmit = async ({ password }) => {
    setServerError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) setServerError(error.message);
    else navigate("/login?reset=success");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto space-y-4 bg-gray-900 p-6 rounded-md"
    >
      <h1 className="text-xl font-bold text-center text-gray-100">
        {t("title")}
      </h1>

      {/* new password */}
      <Input
        id="password"
        type="password"
        label={t("password.label")}
        placeholder={t("password.placeholder")}
        autoComplete="new-password"
        register={register}
        validation={{
          required : t("errors.passwordRequired"),
          minLength: {
            value  : 6,
            message: t("errors.passwordMin"),
          },
        }}
        error={errors.password}
      />

      {/* server-side error */}
      {serverError && <ErrorMessage error={serverError} />}

      <Button type="submit" disabled={isSubmitting} className="!w-full">
        {isSubmitting ? t("button.loading") : t("button.default")}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
