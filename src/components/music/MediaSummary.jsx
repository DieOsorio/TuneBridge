import { useMediaLinks } from "../../context/music/MediaLinksContext";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import Button from "../ui/Button";
import { useTranslation } from "react-i18next";

const MediaSummary = ({ profileId }) => {
  const { t } = useTranslation("music");
  const { userMediaLinks } = useMediaLinks();
  const { data: mediaLinks = [] } = userMediaLinks(profileId);
  const navigate = useNavigate();

  const getSpotifyEmbedUrl = (url) => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [_, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  };

  const displayedMedia = mediaLinks.slice(0, 2); // Mostrar solo 2

  return (
    <section className="mb-10">
      <ul className="space-y-4 text-center">
        {displayedMedia.map((media) => (
          <li
            key={media.id}
            className="shadow-sm p-4 rounded-lg bg-gradient-to-l to-gray-800"
          >
            <p className="font-medium mb-2 text-center">{media.title}</p>
            {media.media_type === "spotify" ? (
              <iframe
                src={getSpotifyEmbedUrl(media.url)}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded w-full max-w-full"
              />
            ) : (
              <div className="aspect-video bg-black rounded overflow-hidden">
                <ReactPlayer
                  url={media.url}
                  controls
                  width="100%"
                  height="100%"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {mediaLinks.length > 2 && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => navigate(`/media/${profileId}`)}
            className="!text-emerald-600 !text-2xl hover:!text-emerald-700 !bg-transparent"
          >
            {t("media.actions.seeMore")}
          </Button>
        </div>
      )}
    </section>
  );
};

export default MediaSummary;
