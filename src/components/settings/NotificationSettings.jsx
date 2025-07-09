import { useForm } from "react-hook-form";
import { useSettings } from "../../context/settings/SettingsContext";
import Toggle from "../ui/Toggle";
import Button from "../ui/Button";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const NotificationSettings = () => {
  const { t } = useTranslation("settings", { keyPrefix: "notifications" });
  const { notifPrefs, saveNotificationPrefs } = useSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm({
    defaultValues: {
      likes      : true,
      comments   : true,
      connections: true,
      groups     : true,
      matches    : true,
    },
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (notifPrefs) reset(notifPrefs);
  }, [notifPrefs, reset]);

  const onSubmit = async (data) => {
    await saveNotificationPrefs(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-10 bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto"
    >
      <h2 className="text-2xl text-yellow-600 font-semibold mb-6 text-center">
        {t("title")}
      </h2>

      <Toggle 
        id="likes"       
        label={t("toggles.likes")}       
        register={register} 
      />
      <Toggle 
        id="comments"    
        label={t("toggles.comments")}    
        register={register} 
      />
      <Toggle 
        id="connections" 
        label={t("toggles.connections")} 
        register={register} 
      />
      <Toggle 
        id="groups"      
        label={t("toggles.groups")}      
        register={register} 
      />
      <Toggle 
        id="matches"     
        label={t("toggles.matches")}     
        register={register} 
      />

      <div className="pt-4 flex justify-center">
        <Button 
          type="submit" 
          disabled={!isDirty || isSubmitting}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          {isSubmitting 
            ? t("buttons.saving")
            : saved 
              ? t("buttons.saved") 
              : t("buttons.save")
          }
        </Button>
      </div>
    </form>
  );
};

export default NotificationSettings;
