import { useForm } from "react-hook-form";
import { useMediaLinks } from "../../context/music/MediaLinksContext";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useEffect } from "react";
import Button from "../ui/Button";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import React from "react";

const mediaTypeOptions = [
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "vimeo", label: "Vimeo" },
  { value: "file", label: "Direct Audio/Video URL" },
];

interface MediaSettingsForm {
  url: string;
  title: string;
  media_type: string;
}

const MediaSettings: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("music");
  const {
    getMediaLink,
    insertMediaLink,
    updateMediaLink,
  } = useMediaLinks();

  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<MediaSettingsForm>();

  const {
    data: media,
    isLoading,
    error,
  } = getMediaLink(id ?? "");

  useEffect(() => {
    if (isEditing && media) {
      setValue("url", media.url);
      setValue("title", media.title);
      setValue("media_type", media.media_type);
    } else {
      reset();
    }
  }, [id, media, isEditing, setValue, reset]);

  const onSubmit = async (data: MediaSettingsForm) => {
    if (!user?.id) return;
    try {
      if (isEditing) {
        await updateMediaLink({
          id: id ?? "",
          updatedLink: { ...data, profile_id: user.id },
        });
      } else {
        await insertMediaLink({
          ...data,
          profile_id: user.id,
        });
      }
      navigate(`/profile/${user.id}/media`);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  if (!user?.id || (isEditing && isLoading)) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <section className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      <div className="text-center font-semibold">
        <h2 className="text-2xl text-yellow-600 font-semibold text-center mb-4">
          {isEditing ? t("media.titleEdit") : t("media.titleAdd")}
        </h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="url"
          label={t("media.form.url")}
          placeholder={t("media.form.urlPlaceholder")}
          register={register("url")}
          error={errors.url}
        />
        <Input
          id="title"
          label={t("media.form.title")}
          placeholder={t("media.form.titlePlaceholder")}
          maxLength={30}
          validation={{
            maxLength: {
              value: 30,
            },
          }}
          register={register("title")}
          error={errors.title}
        />
        <Select
          id="media_type"
          label={t("media.form.type")}
          options={mediaTypeOptions}
          className=""
          control={undefined as any}
          // The Select component should be refactored to support register for non-form controlled usage
        />
        <div className="flex justify-center mt-16 gap-4">
          <Button type="submit" className="!bg-emerald-600 hover:!bg-emerald-700">
            {isEditing ? t("media.form.update") : t("media.form.add")}
          </Button>
          {isEditing && (
            <Button type="button" onClick={() => navigate(-1)} className="!bg-gray-600 hover:!bg-gray-700">
              {t("media.form.cancel")}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default MediaSettings;
