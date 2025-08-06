import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useMediaLinks } from "@/context/music/MediaLinksContext";
import { useAuth } from "@/context/AuthContext";
import ReactPlayer from "react-player";

import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import Loading from "@/utils/Loading";
import ErrorMessage from "@/utils/ErrorMessage";
import { getSpotifyEmbedUrl, isValidMediaUrl } from "./helpers/mediaValidation";

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

const MediaSettings = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("music");
  const { getMediaLink, insertMediaLink, updateMediaLink } = useMediaLinks();

  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
    setValue,
  } = useForm<MediaSettingsForm>();

  const { data: media, isLoading, error } = getMediaLink(id ?? "");

  const url = watch("url");
  const mediaType = watch("media_type");

  useEffect(() => {
    if (isEditing && media) {
      setValue("url", media.url ?? "");
      setValue("title", media.title ?? "");
      setValue("media_type", media.media_type ?? "");
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
        await insertMediaLink({ ...data, profile_id: user.id });
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
      <div className="text-center font-semibold mb-6">
        <h2 className="text-3xl text-yellow-500 font-bold mb-2">
          {isEditing ? t("media.titleEdit") : t("media.titleAdd")}
        </h2>
        <p className="text-gray-400 text-sm">
          {isEditing ? t("media.form.editDescription") : t("media.form.addDescription")}
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="title"
          label={t("media.form.title")}
          placeholder={t("media.form.titlePlaceholder")}
          maxLength={30}
          register={register}
          error={errors.title}
        />
        <Select
          id="media_type"
          label={t("media.form.type")}
          options={mediaTypeOptions}
          control={control}
        />
        <Input
          id="url"
          label={t("media.form.url")}
          placeholder={t("media.form.urlPlaceholder")}
          register={register}
          error={errors.url}
        />

        {isValidMediaUrl(url, mediaType) && (
          <div
            key={`${mediaType}-${url}`}
            className="rounded-lg border border-gray-700 p-3 bg-black/20 mt-2"
          >
            {mediaType === "spotify" ? (
              <div className="rounded-lg bg-[#1db954] p-1 w-full flex flex-col items-center">
                <iframe
                  src={getSpotifyEmbedUrl(url) || undefined}
                  width="100%"
                  height="80"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-video bg-black rounded overflow-hidden">
                <ReactPlayer url={url} controls width="100%" height="100%" />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center mt-16 gap-4">
          <Button type="submit" className="!bg-emerald-600 hover:!bg-emerald-700">
            {isEditing ? t("media.form.update") : t("media.form.add")}
          </Button>
          {isEditing && (
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="!bg-gray-600 hover:!bg-gray-700"
            >
              {t("media.form.cancel")}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
};

export default MediaSettings;
