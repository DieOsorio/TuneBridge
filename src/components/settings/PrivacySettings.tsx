import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Toggle from "../ui/Toggle";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useSettings } from "../../context/settings/SettingsContext";

export interface PrivacyPrefs {
  show_email: boolean;
  show_last_seen: boolean;
  allow_messages: "all" | "connections_only" | "none";
}

const PrivacySettings: React.FC = () => {
  const { t } = useTranslation("settings", { keyPrefix: "privacy" });
  const { privacyPrefs, savePrivacySettings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<PrivacyPrefs>({
    defaultValues: {
      show_email: false,
      show_last_seen: false,
      allow_messages: "all",
    },
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (privacyPrefs) reset(privacyPrefs);
  }, [privacyPrefs, reset]);

  const onSubmit = async (data: PrivacyPrefs) => {
    await savePrivacySettings(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="flex flex-col gap-10 bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl text-yellow-600 font-semibold mb-6 text-center">
        {t("title")}
      </h2>

      <Toggle
        id="show_email"
        label={t("toggles.showEmail")}
        register={register}
        error={undefined}
      />

      <Toggle
        id="show_last_seen"
        label={t("toggles.showLastSeen")}
        register={register}
        error={undefined}
      />

      <Select
        id="allow_messages"
        label={t("allowMessages.label")}
        options={[
          { value: "all",              label: t("allowMessages.options.all") },
          { value: "connections_only", label: t("allowMessages.options.connections") },
          { value: "none",             label: t("allowMessages.options.none") },
        ]}
        register={register}
      />

      <div className="pt-4 flex justify-center">
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isDirty || isSubmitting}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          {isSubmitting 
            ? t("buttons.saving")
            : saved
              ? t("buttons.saved")
              : t("buttons.save")}
        </Button>
      </div>
    </section>
  );
};

export default PrivacySettings;
