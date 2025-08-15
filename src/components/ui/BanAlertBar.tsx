import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BanAlertBarProps {
  banType: "messaging" | "posting";
}

export default function BanAlertBar({ banType }: BanAlertBarProps) {
  const { t } = useTranslation("ui", { keyPrefix: "bannedUser.alertBar" });

  const messageKey = banType === "messaging" ? "messaging" : "posting";

  return (
    <div className="w-full bg-rose-300 text-gray-950 px-4 py-2 text-center font-semibold select-none">
      {t(messageKey)}{" "}
      <Link
        to="/banned"
        className="underline font-bold hover:text-gray-600 transition-colors"
      >
        {t("linkText")}
      </Link>
    </div>
  );
}
