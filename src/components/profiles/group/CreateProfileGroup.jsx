import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import ImageUploader from "../../../utils/ImageUploader";
import ProfileAvatar from "../ProfileAvatar";
import { IoIosCamera } from "react-icons/io";
import { uploadFileToBucket } from "../../../utils/avatarUtils";
import { useTranslation } from "react-i18next";
import Textarea from "../../ui/Textarea";

const CreateProfileGroup = () => {
  const { t } = useTranslation("profileGroup")
  const { createProfileGroup } = useProfileGroups();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatar_url, setAvatar_url] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const avatarClickRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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
    setError("");
    setLoading(true);

    try {
      let avatar = avatar_url;

      if (selectedFile) {
        avatar = await uploadFileToBucket(
          selectedFile,
          "group-avatars",
          data.name,
          avatar_url,
          true
        );
        setAvatar_url(avatar);
      }

      await createProfileGroup({
        ...data,
        avatar_url: avatar,
        created_by: user.id,
      });

      reset();
      setAvatar_url("");
      setPreview(null);
      navigate(`/profile/${user.id}`);
    } catch (err) {
      setError(err.message || t("createProfileGroup.errors.create"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {t("createProfileGroup.title")}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div ref={avatarClickRef} className="relative w-fit cursor-pointer group">
            <ProfileAvatar 
              group={true} 
              avatar_url={preview || avatar_url}
              className={"!bg-amber-700"} 
            />
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
        </div>

        <Input
          id="name"
          label={t("createProfileGroup.labels.name")}
          placeholder={t("createProfileGroup.placeholders.name")}
          register={register}
          validation={{ required: t("createProfileGroup.validations.name") }}
          error={errors.name?.message}
        />

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
          label={t("createProfileGroup.labels.country")}
          placeholder={t("createProfileGroup.placeholders.country")}
          register={register}
          error={errors.country?.message}
        />

        <Input
          id="city"
          label={t("createProfileGroup.labels.city")}
          placeholder={t("createProfileGroup.placeholders.city")}
          register={register}
          error={errors.city?.message}
        />

        <Input
          id="genre"
          label={t("createProfileGroup.labels.genre")}
          placeholder={t("createProfileGroup.placeholders.genre")}
          register={register}
          error={errors.genre?.message}
        />

        <div className="flex justify-center mt-8 space-x-4 ">
          <Button
            className="!bg-gray-500 hover:!bg-gray-600"
            type="button"
            onClick={handleCancel}
          >
            {t("createProfileGroup.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("createProfileGroup.buttons.creating") : t("createProfileGroup.buttons.create")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfileGroup;
