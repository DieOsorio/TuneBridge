import { useForm } from "react-hook-form";
import { useMediaLinks } from "../../context/music/MediaLinksContext";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Button from "../ui/Button";
import { useTranslation } from "react-i18next";

const mediaTypeOptions = [
  { value: "youtube", label: "YouTube" },
  { value: "spotify", label: "Spotify" },
];

const MusicSection = ({ profileId, isOwnProfile }) => {
  const { t } = useTranslation("music");
  const { userMediaLinks, insertMediaLink, updateMediaLink, deleteMediaLink } = useMediaLinks();
  const { data: mediaLinks = [] } = userMediaLinks(profileId);

  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    if (editingId) {
      const mediaToEdit = mediaLinks.find((m) => m.id === editingId);
      if (mediaToEdit) {
        setValue("url", mediaToEdit.url);
        setValue("title", mediaToEdit.title);
        setValue("media_type", mediaToEdit.media_type);
      }
    } else {
      reset();
    }
  }, [editingId, mediaLinks, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await updateMediaLink({ 
          id: editingId, 
          updatedLink: {
            ...data,
            profile_id: profileId,
          },
        });
      } else {
        await insertMediaLink({ 
          ...data, 
          profile_id: profileId 
        });
      }
      reset();
      setEditingId(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const getSpotifyEmbedUrl = (url) => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!match) return null;

    const [_, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  };


  const handleEdit = (id) => setEditingId(id);
  const handleDelete = async (id) => {
    const toDelete = mediaLinks.find((m) => m.id === id);
    if (toDelete) await deleteMediaLink(toDelete);
  };

  return (
    <section>
      <h2 className="text-3xl font-bold text-center text-sky-500 mb-4"> 
        {t("media.title")}
      </h2>

      {/* Form */}
      {isOwnProfile && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
          <Input
            id="url"
            label={t("media.form.url")}
            placeholder={t("media.form.urlPlaceholder")}
            required
            register={register}
            error={errors.url}
          />
          <Input
            id="title"
            label={t("media.form.title")}
            placeholder={t("media.form.titlePlaceholder")}
            register={register}
            error={errors.title}
          />
          <Select
            id="media_type"
            label={t("media.form.type")}
            options={mediaTypeOptions}
            defaultOption={t("media.form.typePlaceholder")}
            register={register}
            validation={{ required: t("media.form.typeRequired") }}
            error={errors.media_type}
          />
        <div className="flex justify-center gap-4 mt-4">
          <Button
          type="submit"
        >
          {editingId ? t("media.form.update") : t("media.form.add")}
        </Button>
        {editingId && (
          <Button
            type="button"
            onClick={() => {
              setEditingId(null);
              reset();
            }}
            className="!bg-gray-500 hover:!bg-gray-600"
          >
            {t("media.form.cancel")}
          </Button>
        )}
        </div>
      </form>)}

      {/* Media List */}
      <ul className="space-y-4 text-center">
        {mediaLinks.map((media) => (
          <li
            key={media.id}
            className="shadow-sm p-4 rounded-lg bg-gradient-to-l to-gray-800"
          >
            <div className="mb-2 mt-8">
              <p className="font-medium">
                {media.title}
              </p>
            </div>

            <div className="mb-6">
              {media.media_type === "youtube" ? (
                <div className="aspect-video max-w-full bg-[#FF0033] p-1 rounded-lg">
                  <ReactPlayer 
                    url={media.url} 
                    controls 
                    width="100%" 
                    height="100%" 
                  />
                </div>
              ) : media.media_type === "spotify" ? (
                <div className="rounded-lg bg-[#1db954] p-1">
                  <iframe
                    src={getSpotifyEmbedUrl(media.url)}
                    width="100%"
                    height="80"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              ) : (
                <p className="text-red-500">
                  {t("media.player.unsupported", { type: media.media_type })}
                </p>
              )}
            </div>


            {isOwnProfile && (
              <div className="flex gap-4 justify-center"> 
                <Button
                  onClick={() => handleEdit(media.id)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  {t("media.actions.edit")}
                </Button>
                <Button
                  onClick={() => handleDelete(media.id)}
                  className="px-2 py-1 !bg-red-600 hover:!bg-red-700"
                >
                  {t("media.actions.delete")}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MusicSection;
