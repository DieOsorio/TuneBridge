import { Link } from "react-router-dom";
import ReactPlayer from "react-player";

import { 
  FaYoutube, 
  FaCopy, 
  FaCheck, 
  FaEdit, 
  FaTrash, 
  FaExpand, 
  FaFacebook, 
  FaInstagram } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";

import type { MediaLink } from "@/context/music/mediaLinksActions";

interface Props {
  videoMediaLinks: MediaLink[];
  isOwnProfile: boolean | null;
  handleCopyLink: (url: string, id: string) => void;
  copiedId: string | null;
  setExpandedMedia: (media: MediaLink) => void;
  user: any;
  t: any;
  deleteMediaLink: (args: { profile_id: string; id: string }) => void;
}

const VideoMediaGrid = ({
  videoMediaLinks,
  isOwnProfile,
  handleCopyLink,
  copiedId,
  setExpandedMedia,
  user,
  t,
  deleteMediaLink,
}: Props) => {
  if (videoMediaLinks.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-bold text-[#FF0000] mb-4 text-center uppercase">{t("media.types.video")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
        {videoMediaLinks.map((media) => (
          <div key={media.id} className="shadow-sm p-4 rounded-lg bg-gradient-to-l to-gray-800 flex flex-col items-center">
            <div className="mb-2 mt-2 flex flex-col items-center w-full">
              <p className="font-medium text-lg mb-2">{media.title}</p>
              <div className="relative w-full flex justify-center">
                <button
                  className="absolute cursor-pointer top-2 right-2 z-10 bg-black/60 text-white rounded-lg p-1 hover:bg-black/80"
                  title={t("media.titles.expand")}
                  onClick={() => setExpandedMedia(media)}
                >
                  <FaExpand size={24} />
                </button>
                {media.media_type === "youtube" && media.url ? (
                  <div className="aspect-video w-full bg-gray-900 p-1 rounded-lg flex flex-col items-center" style={{ minHeight: 320 }}>
                    <FaYoutube size={40} className="mb-2 text-[#FF0000] bg-gray-200 rounded-lg w-11.5" />
                    <ReactPlayer url={media.url ?? ""} controls width="100%" height="100%" />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gray-900 p-1 rounded-lg flex flex-col items-center" style={{ minHeight: 320 }}>
                    <ReactPlayer url={media.url ?? ""} controls width="100%" height="100%" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-center my-4">
              <button
                className="px-2 py-1 cursor-pointer rounded-lg bg-sky-700 hover:bg-sky-700/50 text-white flex items-center gap-1 transition-all"
                onClick={() => handleCopyLink(media.url ?? "", media.id)}
                title={copiedId === media.id ? t("media.titles.copied") : t("media.titles.copyLink")}
              >
                {copiedId === media.id ? (
                  <FaCheck className="text-emerald-500" />
                ) : (
                  <FaCopy />
                )}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-lg bg-black hover:bg-black/50 text-white flex items-center gap-1 transition-all"
                title={t("media.titles.twitter")}
              >
                <BsTwitterX />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded-lg bg-blue-800 hover:bg-blue-800/50 text-white flex items-center gap-1 transition-all"
                title={t("media.titles.facebook")}
              >
                <FaFacebook />
              </a>
              <a
                href={`https://www.instagram.com/?url=${encodeURIComponent(media.url ?? "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-1.5 py-1 rounded-lg bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 hover:from-pink-400 hover:via-red-400 hover:to-yellow-400 text-white flex items-center gap-1 transition-all"
                title={t("media.titles.instagram")}
              >
                <FaInstagram />
              </a>
            </div>
            {isOwnProfile && (
              <div className="flex gap-4 justify-center mt-auto">
                <Link
                  to={`/media/edit/${media.id}`}
                  className="px-2 py-1 min-w-20 rounded-lg justify-center bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1 transition-all"
                >
                  <FaEdit />
                  {t("media.actions.edit")}
                </Link>
                <button
                  onClick={() => user && deleteMediaLink({ profile_id: user.id, id: media.id })}
                  className="px-2 py-1 min-w-20 rounded-lg justify-center cursor-pointer !bg-red-600 hover:!bg-red-700 flex items-center gap-1 transition-all"
                >
                  <FaTrash />
                  {t("media.actions.delete")}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoMediaGrid;
