import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import { uploadFileToBucket } from "../../utils/avatarUtils";
import ImageUploader from "../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";
import { useForm, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch, UseFormHandleSubmit, Control } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
import Textarea from "../ui/Textarea";
import { useCities, useCountries, useStates } from "../../context/helpers/useCountryCity";
import { Country, State, City } from "country-state-city";

interface ProfileSettingsForm {
  bio: string;
  username: string;
  gender: string;
  country: string;
  state: string;
  birthdate: Date | string | null;
  neighborhood: string;
  firstname: string;
  lastname: string;
}

export interface ProfileSettingsProps {
  profile: any;
  onSave?: () => void;
  onCancel?: () => void;
}

const cleanStateName = (name: string) =>
  name.endsWith(" Department") ? name.replace(/ Department$/, "") : name;

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onSave, onCancel }) => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const { updateProfile } = useProfile();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileSettingsForm>({
    defaultValues: {
      bio: "",
      username: "",
      gender: "",
      country: "",
      state: "",
      birthdate: null,
      neighborhood: "",
      firstname: "",
      lastname: "",
    },
  });

  // Always use string for avatar_url, never null
  const [avatar_url, setAvatar_url] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);

  const avatarClickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile) {
      const countryCode = Country.getAllCountries()
        .find(c => c.name === profile.country)?.isoCode || profile.country || "";
      const stateCode = State.getStatesOfCountry(countryCode)
        .find(s => cleanStateName(s.name) === profile.state)?.isoCode || profile.state || "";
      const neighborhood = City.getCitiesOfState(countryCode, stateCode)
        .find(c => c.name === profile.neighborhood)?.name || profile.neighborhood || "";
      reset({
        bio: profile.bio || "",
        username: profile.username || "",
        gender: profile.gender || "",
        country: countryCode,
        state: stateCode,
        birthdate: profile.birthdate ? new Date(profile.birthdate) : "",
        neighborhood: neighborhood,
        firstname: profile.firstname || "",
        lastname: profile.lastname || "",
      });
      setAvatar_url(
        profile.avatar_url === null || profile.avatar_url === undefined
          ? ""
          : String(profile.avatar_url)
      );
    }
  }, [profile, reset]);

  // fetch lists country, state, neighborhood
  const { data: countries = [] } = useCountries();
  const selectedCountry = watch("country");
  const { data: states = [] } = useStates(selectedCountry);
  const selectedState = watch("state");
  const { data: cities = [] } = useCities(selectedCountry, selectedState);

  const handleAvatarUpdate = (file: File[]) => {
    if (file.length > 0) {
      setSelectedFile(file[0]);
      setPreview(URL.createObjectURL(file[0]));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const onSubmit = async (data: ProfileSettingsForm) => {
    setLocalError("");
    try {
      let avatar: string = avatar_url ?? "";
      if (selectedFile && user?.id) {
        const uploaded = await uploadFileToBucket(
          selectedFile,
          "avatars",
          user.id,
          avatar_url ?? "",
          true,
        );
        avatar = uploaded ?? "";
        setAvatar_url(avatar);
      }
      const countryObj = Country.getCountryByCode(data.country);
      const stateObj = State.getStateByCodeAndCountry(data.state, data.country);
      await updateProfile({
        ...data,
        country: countryObj?.name || data.country,
        state: cleanStateName(stateObj?.name || data.state),
        neighborhood: data.neighborhood,
        avatar_url: avatar,
        id: user?.id || profile?.id,
        email: user?.email || profile?.email || "",
        birthdate: data.birthdate instanceof Date ? data.birthdate.toISOString() : (typeof data.birthdate === "string" ? data.birthdate : null),
      });
      if (onSave) onSave();
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error: any) {
      setLocalError(error.message || t("edit.errors.updateFailed"));
    }
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-yellow-600 text-center mb-4">
        {t("edit.title")}
      </h2>
      {user && (
        <div
          ref={avatarClickRef}
          className="relative w-fit mx-auto cursor-pointer group"
        >
          <ProfileAvatar
            avatar_url={preview || avatar_url}
            gender={watch("gender")}
          />
          <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-80 transition-opacity">
            <IoIosCamera size={20} className="text-gray-700" />
          </div>
        </div>
      )}
      <div className="my-4">
        <ImageUploader
          onFilesUpdate={handleAvatarUpdate}
          amount={1}
          triggerRef={avatarClickRef as any}
          classForLabel=""
        />
      </div>
      {localError && (
        <p className="text-red-500 text-sm text-center">{localError}</p>
      )}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Textarea
          id="bio"
          label={t("edit.labels.bio")}
          placeholder={t("edit.placeholders.bio")}
          register={register("bio")}
          validation={{
            maxLength: {
              value: 100,
              message: t("edit.validation.bioMaxLength"),
            },
          }}
          error={errors.bio}
          maxLength={100}
          watchValue={watch("bio")}
        />
        <Input
          id="firstname"
          label={t("edit.labels.firstname")}
          placeholder={t("edit.placeholders.firstname")}
          register={register("firstname")}
          error={errors.firstname}
        />
        <Input
          id="lastname"
          label={t("edit.labels.lastname")}
          placeholder={t("edit.placeholders.lastname")}
          register={register("lastname")}
          error={errors.lastname}
        />
        <Select
          id="country"
          label={t("edit.labels.country")}
          options={countries.map((c: any) => ({ value: c.isoCode, label: c.name }))}
          control={control}
        />
        {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
        <Select
          id="state"
          label={t("edit.labels.state")}
          options={states.map((s: any) => ({ value: s.isoCode, label: cleanStateName(s.name) }))}
          control={control}
        />
        {errors.state && <p className="text-red-500 text-xs">{errors.state.message}</p>}
        <Select
          id="neighborhood"
          label={t("edit.labels.neighborhood")}
          options={cities.map((c: any) => ({ value: c.name, label: c.name }))}
          control={control}
        />
        {errors.neighborhood && <p className="text-red-500 text-xs">{errors.neighborhood.message}</p>}
        <Input
          id="username"
          label={t("edit.labels.username")}
          placeholder={t("edit.placeholders.username")}
          register={register("username")}
          maxLength={12}
          validation={{
            required: t("edit.validation.usernameRequired"),
            maxLength: {
              value: 12,
              message: t("edit.validation.usernameMaxLength"),
            },
            pattern: {
              value: /^[a-zA-Z0-9_.-]+$/,
              message: t("edit.validation.usernamePattern"),
            },
          }}
          error={errors.username}
        />
        <Select
          id="gender"
          label={t("edit.labels.gender")}
          options={[ 
            { value: "male", label: t("edit.placeholders.genderOptions.male") },
            { value: "female", label: t("edit.placeholders.genderOptions.female") },
            { value: "other", label: t("edit.placeholders.genderOptions.other") },
          ]}
          control={control}
        />
        {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
        <div className="sm:col-span-1">
          <label htmlFor="birthdate" className="block text-sm font-medium mb-2 text-gray-200">
            {t("edit.labels.birthdate")}
          </label>
          <DatePicker
            value={(() => {
              const val = watch("birthdate");
              if (val instanceof Date) return val;
              if (typeof val === "string" && val) {
                const d = new Date(val);
                return isNaN(d.getTime()) ? null : d;
              }
              return null;
            })()}
            onChange={(date) => {
              if (date && typeof (date as any).toDate === "function") {
                setValue("birthdate", (date as any).toDate());
              } else if (date instanceof Date) {
                setValue("birthdate", date);
              } else {
                setValue("birthdate", null);
              }
            }}
            slotProps={{
              textField: {
                variant: "outlined",
                size: "small",
                fullWidth: true,
                error: !!errors.birthdate,
                helperText: errors.birthdate?.message,
              },
            }}
          />
        </div>
        <div className="sm:col-span-2 flex justify-center mt-10 gap-4">
          <Button
            className="!bg-emerald-600 hover:!bg-emerald-700 text-white"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? t("edit.buttons.saving")
              : saved
              ? t("edit.labels.saved")
              : t("edit.buttons.save")}
          </Button>
          {onCancel && (
            <Button
              className="!bg-gray-600 hover:!bg-gray-700 text-white"
              type="button"
              onClick={() => {
                onCancel();
              }}
            >
              {t("edit.buttons.cancel")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
