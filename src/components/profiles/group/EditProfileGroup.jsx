import { useState, useEffect, useRef } from "react";
import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import ProfileAvatar from "../ProfileAvatar";
import ImageUploader from "../../../utils/ImageUploader";
import { IoIosCamera } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { uploadFileToBucket } from "../../../utils/avatarUtils";
import Textarea from "../../ui/Textarea";

const EditProfileGroup = ({ group, onSave, onCancel }) => {
  const { t } = useTranslation("profileGroup");
  const { updateProfileGroup } = useProfileGroups();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      country: "",
      city: "",
      genre: "",
    },
  });

  const [avatar_url, setAvatar_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState("");

  const avatarClickRef = useRef(null);

  useEffect(() => {
    if (group) {
      reset({
        name: group.name || "",
        bio: group.bio || "",
        country: group.country || "",
        city: group.city || "",
        genre: group.genre || "",
      });
      setAvatar_url(group.avatar_url || "");
    }
  }, [group, reset]);

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
        avatar = await uploadFileToBucket(
          selectedFile,
          "group-avatars",
          group.id,
          avatar_url,
          true
        );
        setAvatar_url(avatar);
      }

      await updateProfileGroup({
        id: group.id,
        updatedGroup: {
          ...data,
          avatar_url: avatar,
        }
      });

      if (onSave) onSave();
    } catch (error) {
      setLocalError(error.message || t("editProfileGroup.errors.loading"));
    }
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {t("editProfileGroup.title")}
      </h2>

      <div
        ref={avatarClickRef}
        className="relative w-fit mx-auto cursor-pointer group"
      >
        <ProfileAvatar avatar_url={preview || avatar_url} />
        <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:opacity-100 opacity-80 transition-opacity">
          <IoIosCamera size={20} className="text-gray-700" />
        </div>
      </div>
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
          label={t("createProfileGroup.labels.bio")}
          placeholder={t("createProfileGroup.placeholders.bio")}
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
          id="country"
          label={t("editProfileGroup.labels.country")}
          placeholder={t("editProfileGroup.placeholders.country")}
          register={register}
          error={errors.country?.message}
          classForLabel="!text-gray-400"
        />

        <Input
          id="city"
          label={t("editProfileGroup.labels.city")}
          placeholder={t("editProfileGroup.placeholders.city")}
          register={register}
          error={errors.city?.message}
          classForLabel="!text-gray-400"
        />

        <Input
          id="genre"
          label={t("editProfileGroup.labels.genre")}
          placeholder={t("editProfileGroup.placeholders.genre")}
          register={register}
          error={errors.genre?.message}
          classForLabel="!text-gray-400"
        />

        <Input
          id="name"
          label={t("editProfileGroup.labels.name")}
          placeholder={t("editProfileGroup.placeholders.name")}
          register={register}
          validation={{ required: t("editProfileGroup.validations.name") }}
          error={errors.name?.message}
          classForLabel="!text-gray-400"
        />

        <div className="sm:col-span-2 flex justify-center mt-4 space-x-4">
          <Button
            className="!bg-gray-500 hover:!bg-gray-600"
            type="button"
            onClick={onCancel}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("editProfileGroup.buttons.saving") : t("editProfileGroup.buttons.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileGroup;
