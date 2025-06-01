import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Loading from "../../utils/Loading";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation(["auth", "common"]);
  const { 
    user, 
    loading, 
    signIn, error: 
    authError 
  } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (user && user.email_confirmed_at && !loading) {
      navigate(`/profile/${user.id}`);
    }
  }, [user, navigate, loading]);

  const onSubmit = async (data) => {
    try {
      setError("");
      await signIn(data.email, data.password);
    } catch (err) {
      setError(t("auth:login.errors.authError", { error: err.message }));
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="text-gray-950 flex justify-center items-center h-screen">
      <div className="border p-6 rounded-lg shadow-lg w-96 bg-white">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {t("auth:login.title")}
        </h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {authError && <div className="text-red-500 text-sm mb-4">{authError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="email"
            label={t("common:form.email")}
            type="email"
            placeholder={t("common:form.placeholders.email")}
            autoComplete="email"
            register={register}
            validation={{ 
              required: t("auth:login.errors.emailRequired") 
            }}
            error={errors.email}
          />

          <Input
            id="password"
            label={t("common:form.password")}
            type="password"
            placeholder={t("common:form.placeholders.password")}
            autoComplete="current-password"
            register={register}
            validation={{ 
              required: t("auth:login.errors.passwordRequired") 
            }}
            error={errors.password}
          />

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("auth:login.button.loading") : t("auth:login.button.default")}
          </Button>
        </form>

        <p className="mt-4 text-sm text-center">
          {t("auth:login.noAccount")}{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            {t("auth:login.signupHere")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
