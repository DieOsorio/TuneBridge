import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useBannedUsers } from "@/context/admin/BannedUsersContext";

import FeedbackForm from "@/utils/FeedbackForm";
import Button from "@/components/ui/Button";

export default function BannedUserNotice() {
  const { t, i18n } = useTranslation("ui", { keyPrefix: "bannedUser" });
  const { bannedUser } = useBannedUsers();
  const [showAppealForm, setShowAppealForm] = useState(false);

  const localeMap = { en: enUS, es: es };
  const currentLocale = localeMap[i18n.language.startsWith("es") ? "es" : "en"];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPpp", { locale: currentLocale });
    } catch {
      return dateString;
    }
  };

  if (!bannedUser) return null;

  const reason = bannedUser?.reason ?? t("noReason");
  const bannedUntil = bannedUser?.banned_until
    ? formatDate(bannedUser.banned_until)
    : t("indefinite");
  const type = bannedUser?.type ?? "unknown";

  const titleKey = `titles.${type}`;
  const descriptionKey = `descriptions.${type}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 py-8">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg w-full max-w-2xl p-8 text-white">
        
        {/* Header */}
        <h1 className="text-3xl text-center font-bold text-rose-300 mb-2">{t(titleKey)}</h1>
        <p className="text-gray-400 text-center mb-6">{t(descriptionKey)}</p>
        <hr className="border-gray-700 mb-6" />

        {/* Ban details */}
        <div className="space-y-4 text-left">
          <div className="space-x-1">
            <span className="font-semibold text-gray-200">{t("reasonLabel")}:</span>{" "}
            <span className="text-gray-400">{reason}</span>
          </div>
          <div className="space-x-1">
            <span className="font-semibold text-gray-200">{t("bannedUntilLabel")}:</span>{" "}
            <span className="text-gray-400">{bannedUntil}</span>
          </div>
        </div>

        {/* Action */}
        <div className="mt-8 text-center">
          {!showAppealForm ? (
            <Button
              onClick={() => setShowAppealForm(true)}            
            >
              {t("appealButton")}
            </Button>
          ) : (
            <div className="mt-6">
              <FeedbackForm onClose={() => setShowAppealForm(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
