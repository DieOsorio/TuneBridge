import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaLinks } from "@/context/music/MediaLinksContext";
import { useAuth } from "@/context/AuthContext";
import ReactPlayer from "react-player";

import { 
  FaSpotify, 
  FaYoutube, 
  FaMusic, 
  FaCopy, 
  FaFacebook, 
  FaInstagram 
} from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";


import Button from "../ui/Button";
import PlusButton from "../ui/PlusButton";
import MediaSummarySkeleton from "./skeletons/MediaSummarySkeleton";

import type { MediaLink } from "@/context/music/mediaLinksActions";

interface MediaSummaryProps {
  profileId: string;
}

const MediaSummary = ({ profileId }: MediaSummaryProps) => {
  const { user } = useAuth();
  const { t } = useTranslation("music");
  const { userMediaLinks } = useMediaLinks();
  const { data: mediaLinks = [], isLoading } = userMediaLinks(profileId);
  const navigate = useNavigate();

  const ownProfile = user && user.id === profileId;

  if (isLoading) return <MediaSummarySkeleton />;

  const getSpotifyEmbedUrl = (url: string): string | null => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [_, type, id] = match;
    return `https://open.spotify.com/embed/${type}/${id}`;
  };

  const displayedMedia = (mediaLinks as MediaLink[]).slice(0, 2);

  return (
    <section className="mb-10">
      {ownProfile && (
        <PlusButton 
          label={t("media.actions.add")} 
          to="/media/create" 
        />
      )}
      <ul className="space-y-4 text-center">
        {displayedMedia.map((media) => (
          <li key={media.id} className="shadow-sm p-4 rounded-lg bg-gradient-to-l to-gray-800">
            <p className="font-medium mb-2 text-center">{media.title}</p>

            {/* Media preview */}
            {media.media_type === "spotify" && media.url ? (
              <iframe
                src={getSpotifyEmbedUrl(media.url) || undefined}
                width="100%"
                height="80"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded w-full max-w-full"
              />
            ) : media.url ? (
              <div className="aspect-video bg-black rounded overflow-hidden">
                <ReactPlayer
                  url={media.url}
                  controls
                  width="100%"
                  height="100%"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            ) : null}

            {/* New: Action buttons */}
            <div className="mt-4 flex justify-center gap-3 flex-wrap">
              {/* Type Icon */}
              {media.media_type === "spotify" && <FaSpotify size={22} className="text-[#1db954] mr-auto" />}
              {media.media_type === "youtube" && <FaYoutube size={22} className="text-[#FF0000] mr-auto bg-gray-200 rounded-lg w-7.5" />}
              {media.media_type === "audio" && <FaMusic size={22} className="text-blue-400 mr-auto" />}

              {/* Copy button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(media.url ?? "");
                  // Optional: feedback with toast or similar
                }}
                className="px-2 py-1 cursor-pointer rounded bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-1 text-sm"
                title={t("media.titles.copyLink")}
              >
                <FaCopy />
              </button>

              {/* Social sharing */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-black hover:bg-gray-900 text-white flex items-center gap-1 text-sm"
                title={t("media.titles.twitter")}
              >
                <BsTwitterX />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white flex items-center gap-1 text-sm"
                title={t("media.titles.facebook")}
              >
                <FaFacebook />
              </a>
              <a
                href={`https://www.instagram.com/?url=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-400 hover:via-red-400 hover:to-yellow-400 text-white flex items-center gap-1 text-sm"
                title={t("media.titles.instagram")}
              >
                <FaInstagram />
              </a>
            </div>
          </li>
        ))}
      </ul>
      {mediaLinks && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => navigate(`/media/${profileId}`)}
            className="!text-emerald-600 !text-lg hover:!text-emerald-700 !bg-transparent"
          >
            {t("media.actions.seeMore")}
          </Button>
        </div>
      )}
    </section>
  );
};

export default MediaSummary;
