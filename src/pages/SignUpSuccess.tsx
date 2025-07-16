import { Link } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

const SignUpSuccess: FC = () => {
  const { t } = useTranslation("auth");

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-center px-4">
      <div className="max-w-md bg-gray-800 shadow-lg rounded-lg p-10">
        <div className="flex justify-center mb-4">
          <AiOutlineCheckCircle className="text-green-500" size={50} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          {t("signupSuccess.title")}
        </h2>
        <p className="text-gray-300">
          {t("signupSuccess.message")}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {t("signupSuccess.note")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {t("signupSuccess.goHome")}
        </Link>
      </div>
    </div>
  );
};

export default SignUpSuccess;
