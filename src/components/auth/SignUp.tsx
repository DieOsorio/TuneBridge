import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Loading from "../../utils/Loading";
import SignUpSuccess from "../../pages/SignUpSuccess";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SignUpFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUp = () => {
  const { t } = useTranslation(["auth", "common"]);
  const { signUp, loading: authLoading, error: authError } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormInputs>();

  const onSubmit = async ({ email, password, confirmPassword, username }: SignUpFormInputs) => {
    if (password !== confirmPassword) return;
    try {
      await signUp(email, password, username);
      setSuccess(true);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  if (authLoading) return <Loading />;
  if (success) return <SignUpSuccess />;

  return (
    <div className="text-white flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-gray-600">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {t("auth:signup.title")}
        </h2>
        {authError && (
          <div className="text-red-500 text-sm mb-4">{authError}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="username"
            label={t("common:form.username")}
            placeholder={t("common:form.placeholders.username")}
            register={register}
            maxLength={12}
            watchValue={watch("username")}
            validation={{
              required: t("signup.errors.usernameRequired"),
              maxLength: {
                value: 12,
                message: t("signup.errors.usernameMax"),
              },
              pattern: {
                value: /^[a-zA-Z0-9_.-]+$/,
                message: t("signup.errors.usernamePattern"),
              },
            }}
            error={errors.username}
          />
          <Input
            id="email"
            label={t("common:form.email")}
            type="email"
            placeholder={t("common:form.placeholders.email")}
            register={register}
            validation={{
              required: t("signup.errors.emailRequired"),
              pattern: {
                value: /^\S+@\S+$/i,
                message: t("signup.errors.emailInvalid"),
              },
            }}
            error={errors.email}
          />
          <Input
            id="password"
            label={t("common:form.password")}
            type="password"
            placeholder={t("common:form.placeholders.password")}
            register={register}
            validation={{
              required: t("signup.errors.passwordRequired"),
              minLength: {
                value: 6,
                message: t("signup.errors.passwordMin"),
              },
            }}
            error={errors.password}
          />
          <Input
            id="confirmPassword"
            label={t("common:form.confirmPassword")}
            type="password"
            placeholder={t("common:form.placeholders.confirmPassword")}
            register={register}
            validation={{
              required: t("signup.errors.confirmRequired"),
              validate: (value: string) =>
                value === watch("password") || t("signup.errors.passwordsNoMatch"),
            }}
            error={errors.confirmPassword}
          />
          <Button className="w-full" type="submit">
            {t("auth:signup.button")}
          </Button>
        </form>
        <p className="text-sm text-center mt-4">
          {t("auth:signup.alreadyHaveAccount")} {" "}
          <Link to="/login" className="text-sky-500 hover:underline">
            {t("auth:signup.loginHere")}
          </Link>
        </p>
        <p className="text-xs text-center mt-2 text-gray-300">
          {t("auth:signup.agreeTo")} {" "}
          <Link
            to="/terms"
            target="_blank"
            className="text-slate-400 hover:underline"
            rel="noopener noreferrer"
          >
            {t("auth:signup.termsAndConditions")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
