import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ProfileAvatar from "./ProfileAvatar";
import Select from "../ui/Select";
import { uploadFileToBucket } from "../../utils/avatarUtils";
import { useView } from "../../context/ViewContext";
import ImageUploader from "../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { useTranslation } from "react-i18next";
import Textarea from "../ui/Textarea";

const EditProfile = ({ profile, onSave, onCancel }) => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { manageView } = useView();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bio: "",
      username: "",
      gender: "",
      country: "",
      birthdate: null,
      city: "",
      firstname: "",
      lastname: "",
    },
  });

  const [avatar_url, setAvatar_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState("");

  const avatarClickRef = useRef(null);

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio || "",
        username: profile.username || "",
        gender: profile.gender || "",
        country: profile.country || "",
        birthdate: profile.birthdate ? new Date(profile.birthdate) : "",
        city: profile.city || "",
        firstname: profile.firstname || "",
        lastname: profile.lastname || "",
      });
      setAvatar_url(profile.avatar_url || "");
    }
  }, [profile, reset]);

  const handleAvatarUpdate = (file) => {
    if (file.length > 0) {
      setSelectedFile(file[0]);
      setPreview(URL.createObjectURL(file[0]));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const onSubmit = async (data) => {
    setLocalError("");

    try {
      let avatar = avatar_url;

      if (selectedFile) {
        // Use the generalized function to upload the avatar
        avatar = await uploadFileToBucket(
          selectedFile, 
          "avatars", 
          user.id, 
          avatar_url,
          true,
        );
        setAvatar_url(avatar);
      }

      await updateProfile({
        ...data,
        avatar_url: avatar,
        id: user.id,
      });

      manageView("about", "profile");
      if (onSave) onSave();
    } catch (error) {
      setLocalError(error.message || t("edit.errors.updateFailed"));
    }
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
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
          triggerRef={avatarClickRef}
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
          register={register}
          validation={{
            maxLength: {
              value: 100,
              message: t("edit.validation.bioMaxLength"),
            }
          }}
          error={errors.bio}
          maxLength={100}
          watchValue={watch("bio")}
          classForLabel="text-gray-400" 
        />
            
        <Input
          id="firstname"
          label={t("edit.labels.firstname")}
          placeholder={t("edit.placeholders.firstname")}
          register={register}
          error={errors.firstname}
          classForLabel="!text-gray-400"
        />

        <Input
          id="lastname"
          label={t("edit.labels.lastname")}
          placeholder={t("edit.placeholders.lastname")}
          register={register}
          error={errors.lastname}
          classForLabel="!text-gray-400"
        />

        <Input
          id="country"
          label={t("edit.labels.country")}
          placeholder={t("edit.placeholders.country")}
          register={register}
          error={errors.country}
          classForLabel="!text-gray-400"
        />

        <Input
          id="city"
          label={t("edit.labels.city")}
          placeholder={t("edit.placeholders.city")}
          register={register}
          error={errors.city}
          classForLabel="!text-gray-400"
        />

        <Input
          id="username"
          classForLabel="!text-gray-400"
          label={t("edit.labels.username")}
          placeholder={t("edit.placeholders.username")}
          register={register}
          maxLength={12}
          validation={{
            required: t("edit.validation.usernameRequired"),
            maxLength: {
              value: 12,
              message: t("edit.validation.usernameMaxLength"),
            },
            pattern: {
              value: /^[a-zA-Z0-9_.-]+$/,
              message:
                t("edit.validation.usernamePattern"),
            },
          }}
          error={errors.username}
        />

        <Select
          id="gender"
          label={t("edit.labels.gender")}
          classForLabel="!text-gray-400"
          defaultOption={t("edit.placeholders.genderDefault")}
          options={[
            { value: "male", label: t("edit.placeholders.genderOptions.male") },
            { value: "female", label: t("edit.placeholders.genderOptions.female") },
            { value: "other", label: t("edit.placeholders.genderOptions.other") }
          ]}
          value={watch("gender")}
          onChange={e => setValue("gender", e.target.value)}
          register={register}
          error={errors.gender}
        />

        <div className="sm:col-span-2">
          <label htmlFor="birthdate" className="block text-sm font-medium mb-2 text-gray-400">
            {t("edit.labels.birthdate")}
          </label>
          <DatePicker
            value={watch("birthdate")}
            onChange={(date) => setValue("birthdate", date)}
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
            {isSubmitting ? t("edit.buttons.saving") : t("edit.buttons.save")}
          </Button>
          <Button
            className="!bg-gray-600 hover:!bg-gray-700 text-white"
            type="button"
            onClick={() => {
              manageView("about", "profile");
              if (onCancel) onCancel();
            }}
          >
            {t("edit.buttons.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
