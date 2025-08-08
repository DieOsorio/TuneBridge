import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Button from "@/components/ui/Button";

const FeedbackSuccess = () => {
  const { t } = useTranslation("feedback", { keyPrefix: "success" });

  return (
    <div className="max-w-md mx-auto p-8 text-center bg-gray-900 rounded-lg shadow-md mt-16">
      <h1 className="text-3xl font-semibold text-emerald-600 mb-4">
        {t("title")}
      </h1>
      <p className="text-gray-400 mb-8">
        {t("description")}
      </p>
      <Link to="/">
        <Button className="!bg-emerald-600 hover:!bg-emerald-700">
          {t("buttons.backHome")}
        </Button>
      </Link>
    </div>
  );
};

export default FeedbackSuccess;
