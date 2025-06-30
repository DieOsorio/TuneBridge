// components/settings/PrivacySettings.jsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Toggle from "../ui/Toggle";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { useSettings } from "../../context/settings/SettingsContext";

const PrivacySettings = () => {
  const { t } = useTranslation("settings", { keyPrefix: "privacy" });
  const { privacyPrefs, savePrivacySettings } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      show_email: false,
      show_last_seen: false,
      allow_messages: "all",
    },
  });

  // Sync form when prefs arrive/change
  useEffect(() => {
    if (privacyPrefs) reset(privacyPrefs);
  }, [privacyPrefs, reset]);

  // Submit → upsert prefs
  const onSubmit = async (data) => {
    await savePrivacySettings(data);
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
      />

      <Toggle
        id="show_last_seen"
        label={t("toggles.showLastSeen")}
        register={register}
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
          {isSubmitting ? t("buttons.saving") : t("buttons.save")}
        </Button>
      </div>
    </section>
  );
};

export default PrivacySettings;
