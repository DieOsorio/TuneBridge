import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/settings/SettingsContext";

import Input  from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog"
import { useTheme } from "../../context/ThemeContext";
import { useProfile } from "../../context/profile/ProfileContext";

const LANGS  = [ { value:"en", label:"English" }, { value:"es", label:"Español" } ];
const THEMES = [ { value:"dark", label:"Dark"  }, { value:"light", label:"Light" } ];

const AccountSettings = () => {
  const { setMode } = useTheme();
  const { t } = useTranslation("settings", { keyPrefix: "account" });
  const { deleteProfile } = useProfile();
  const { user, updatePassword, deleteMyAccount, signOut } = useAuth();

  /* ─── UI prefs hooks ─── */
  const { prefs, saveUiPreferences } = useSettings();

  /* ====== SECTION 1 – Interface preferences ====== */
  const {
    control: prefCtrl,
    handleSubmit: handlePrefs,
    formState: { isSubmitting: savingPrefs }
  } = useForm({
    defaultValues: {
      language: prefs?.lang  ?? "en",
      theme   : prefs?.theme ?? "dark"
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const [saved, setSaved] = useState(false);
  const savePrefs = async ({ language, theme }) => {
    await saveUiPreferences({ lang: language, theme });
    setMode(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /* ====== SECTION 2 – Change password ====== */
  const {
    register,
    handleSubmit: handlePassword,
    watch,
    reset,
    formState: { errors, isSubmitting: savingPass }
  } = useForm();

  const onChangePassword = async ({ newPassword }) => {
    await updatePassword(newPassword);
    reset();
  };

  /* ====== SECTION 3 – Delete account ====== */
  const handleDeleteAccount = async () => {
     try {
    await deleteProfile(user.id); 
    await deleteMyAccount();                 
    await signOut();                     
  } catch (err) {
    console.error(err);
  } finally {
    setDialogOpen(false);
  }
  };

  return (
    <div className="flex flex-col gap-10 bg-gradient-to-l to-gray-900 light:bg-gradient-to-l light:to-gray-200 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">

      {/* ─── Account info ─── */}
      <section className="text-center">
        <h2 className="text-2xl text-yellow-600 font-semibold mb-4">{t("title")}</h2>
        <p className="text-gray-200 light:text-gray-900 font-bold">Email: <span className="text-gray-400 light:text-gray-600">{user.email}</span></p>
      </section>

      {/* ─── Interface preferences ─── */}
      <section>
        <h3 className="text-lg font-semibold text-center mb-4">{t("preferences.title")}</h3>

        <form onSubmit={handlePrefs(savePrefs)} className="max-w-lg mx-auto space-y-6">
          <Select
            id="language"
            label={t("labels.language")}
            control={prefCtrl}
            options={LANGS}
            className="bg-gray-800 text-white light:bg-gray-200 light:text-gray-900"
          />

          <Select
            id="theme"
            label={t("labels.theme")}
            control={prefCtrl}
            options={THEMES}
            className="bg-gray-800 text-white light:bg-gray-200 light:text-gray-900"
          />

          <div className="sm:col-span-2 flex justify-center gap-4">
            <Button 
              type="submit" 
              disabled={savingPrefs}
              className="!bg-emerald-600 hover:!bg-emerald-700"
            >
              {savingPrefs 
                ? t("buttons.saving")
                : saved 
                  ? t("buttons.saved")
                  : t("buttons.save")
              }
            </Button>
          </div>
        </form>
      </section>

      {/* ─── Change password ─── */}
      <section>
        <h3 className="text-lg text-center font-semibold mb-4">{t("password.title")}</h3>

        <form onSubmit={handlePassword(onChangePassword)} className="max-w-lg mx-auto space-y-6">
          <Input
            id="newPassword"
            type="password"
            label={t("labels.new")}
            placeholder={t("placeholders.new")}
            register={register}
            validation={{
              required : t("validations.required"),
              minLength: { value: 6, message: t("validations.min") }
            }}
            error={errors.newPassword}
          />

          <Input
            id="confirmPassword"
            type="password"
            label={t("labels.confirm")}
            placeholder={t("placeholders.confirm")}
            register={register}
            validation={{
              validate: v => v === watch("newPassword") || t("validations.mismatch")
            }}
            error={errors.confirmPassword}
          />

          <div className="sm:col-span-2 flex justify-center gap-4">
            <Button 
              type="submit" 
              disabled={savingPass}
              className="!bg-emerald-600 hover:!bg-emerald-700"
            >
              {savingPass ? t("buttons.saving") : t("buttons.change")}
            </Button>
          </div>
        </form>
      </section>

      {/* ─── Danger zone ─── */}
      <section className="border-t sm:w-lg mx-auto text-center border-gray-700 pt-10">
        <h3 className="text-lg font-semibold text-red-400 mb-4">
          {t("danger.title")}
        </h3>

        <Button
          className="!bg-red-700 hover:!bg-red-800"
          onClick={() => setDialogOpen(true)}
        >
          {t("buttons.delete")}
        </Button>
      </section>

        <ConfirmDialog
          isOpen={dialogOpen}
          title={t("danger.title")}
          message={t("danger.confirm")}
          onConfirm={handleDeleteAccount}
          onCancel={() => setDialogOpen(false)}
          confirmLabel={t("danger.yesDelete")}
          cancelLabel={t("danger.cancel")}
          color="error"
        />
    </div>
  );
};

export default AccountSettings;
