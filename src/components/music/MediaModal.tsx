import { FaSpotify, FaMusic, FaYoutube, FaTimes } from "react-icons/fa";
import ReactPlayer from "react-player";
import React from "react";
import type { MediaLink } from "@/context/music/mediaLinksActions";

interface Props {
  expandedMedia: MediaLink | null;
  setExpandedMedia: (media: MediaLink | null) => void;
  t: any;
  getSpotifyEmbedUrl: (url: string) => string | null;
}

const MediaModal: React.FC<Props> = ({ expandedMedia, setExpandedMedia, t, getSpotifyEmbedUrl }) => {
  if (!expandedMedia) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full relative">
        <button
          className="absolute top-1 right-2 cursor-pointer bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
          onClick={() => setExpandedMedia(null)}
          title={t("media.titles.close")}
        >
          <FaTimes size={20} />
        </button>
        <div className="mb-4">
          <p className="font-bold text-xl mb-2">{expandedMedia.title}</p>
        </div>
        {expandedMedia.media_type === "spotify" && expandedMedia.url ? (
          <div className="rounded-lg bg-[#1db954] p-1 flex flex-col items-center">
            <FaSpotify size={32} className="mb-2 text-white" />
            <iframe
              src={getSpotifyEmbedUrl(expandedMedia.url) || undefined}
              width="100%"
              height="80"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        ) : expandedMedia.media_type === "audio" && expandedMedia.url ? (
          <div className="w-full bg-gray-900 p-4 rounded-lg flex flex-col items-center" style={{ minHeight: 120 }}>
            <FaMusic size={32} className="mb-2 text-blue-400" />
            <audio controls src={expandedMedia.url} className="w-full" />
          </div>
        ) : expandedMedia.media_type === "youtube" && expandedMedia.url ? (
          <div className="aspect-video w-full bg-gray-900 p-1 rounded-lg flex flex-col items-center" style={{ minHeight: 320 }}>
            <FaYoutube size={40} className="mb-2 text-[#FF0000] bg-gray-200 rounded-lg w-11.5" />
            <ReactPlayer url={expandedMedia.url} controls width="100%" height="100%" />
          </div>
        ) : expandedMedia.url ? (
          <div className="aspect-video w-full bg-gray-900 p-1 rounded-lg flex flex-col items-center" style={{ minHeight: 320 }}>
            <ReactPlayer url={expandedMedia.url} controls width="100%" height="100%" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MediaModal;
