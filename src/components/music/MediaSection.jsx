
import { useMediaLinks } from "../../context/music/MediaLinksContext";
import ReactPlayer from "react-player";
import { useTranslation } from "react-i18next";
import ShinyText from "../ui/ShinyText";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import PlusButton from "../social/ads/PlusButton";


const MediaSection = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const { t } = useTranslation("music");
  const { 
    userMediaLinks,
    deleteMediaLink 
  } = useMediaLinks();
  const { data: mediaLinks = [], isLoading, error } = userMediaLinks(id);


  const isOwnProfile = user.id == id;
  

  if (isLoading || !id) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;
  if (!Array.isArray(mediaLinks)) {
    return <ErrorMessage error="Invalid media data received" />
  }


  const getSpotifyEmbedUrl = (url) => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!match) return null;

    const [_, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  };


  // Sort mediaLinks: all Spotify first, then the rest
  const sortedMediaLinks = [
    ...mediaLinks.filter((m) => m.media_type === 'spotify'),
    ...mediaLinks.filter((m) => m.media_type !== 'spotify'),
  ];

  return (
    <section className="max-w-260 mx-auto">
      <div className="text-center font-semibold">
        <ShinyText text={t("media.title")} className="text-3xl font-semibold tracking-wide mb-12"/>
      </div>

      {isOwnProfile && (
        <PlusButton
          label={t("media.actions.add")}
          to="/media/create"
        />
      )}

      {/* Media List */}
      <ul className="space-y-4 text-center">
        {sortedMediaLinks.map((media) => (
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
              {/* Use ReactPlayer for all supported types except Spotify */}
              {media.media_type === "spotify" ? (
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
                <div className="aspect-video max-w-full bg-gray-900 p-1 rounded-lg">
                  <ReactPlayer 
                    url={media.url} 
                    controls 
                    width="100%" 
                    height="100%" 
                  />
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="flex gap-4 justify-center"> 
                <Link
                  to={`/media/edit/${media.id}`}
                  className="px-2 py-1 min-w-20 rounded-lg bg-yellow-600 hover:bg-yellow-700"
                >
                  {t("media.actions.edit")}
                </Link>
                <button
                  onClick={() => deleteMediaLink({profile_id: user.id ,id: media.id})}
                  className="px-2 py-1 min-w-20 rounded-lg cursor-pointer !bg-red-600 hover:!bg-red-700"
                >
                  {t("media.actions.delete")}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MediaSection;
