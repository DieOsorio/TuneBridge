import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMediaLinks } from "@/context/music/MediaLinksContext";
import { useAuth } from "@/context/AuthContext";

import ShinyText from "../ui/ShinyText";
import Loading from "@/utils/Loading";
import ErrorMessage from "@/utils/ErrorMessage";
import PlusButton from "../ui/PlusButton";
import AudioMediaGrid from "./AudioMediaGrid";
import VideoMediaGrid from "./VideoMediaGrid";
import MediaModal from "./MediaModal";

import type { MediaLink } from "@/context/music/mediaLinksActions";
import { getSpotifyEmbedUrl } from "./helpers/mediaValidation";

const MediaSection = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("music");
  const { userMediaLinks, deleteMediaLink } = useMediaLinks();
  const [expandedMedia, setExpandedMedia] = useState<MediaLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  let mediaLinks: MediaLink[] = [];
  let isLoading = false;
  let error: any = null;
  if (id) {
    const result = userMediaLinks(id);
    mediaLinks = (result.data ?? []) as MediaLink[];
    isLoading = result.isLoading;
    error = result.error;
  }

  const isOwnProfile = user && user.id === id;

  if (isLoading || !id) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;
  if (!Array.isArray(mediaLinks)) {
    return <ErrorMessage error="Invalid media data received" />;
  }

  const sortedMediaLinks: MediaLink[] = [
    ...mediaLinks.filter((m) => m.media_type === "spotify"),
    ...mediaLinks.filter((m) => m.media_type !== "spotify"),
  ];

  // Separate media by type
  const audioMediaLinks = sortedMediaLinks.filter(
    (media) => media.media_type === "audio" || media.media_type === "spotify"
  );
  const videoMediaLinks = sortedMediaLinks.filter(
    (media) => media.media_type === "youtube" || (media.media_type !== "audio" && media.media_type !== "spotify")
  );

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <section className="max-w-260 mx-auto">
      <div className="text-center font-semibold">
        <ShinyText text={t("media.title")} className="text-3xl font-semibold tracking-wide mb-12" />
      </div>
      {isOwnProfile && (
        <PlusButton 
          label={t("media.actions.add")} 
          to="/media/create" 
        />
      )}

      {/* Audio Section */}
      <AudioMediaGrid
        audioMediaLinks={audioMediaLinks}
        isOwnProfile={isOwnProfile}
        handleCopyLink={handleCopyLink}
        copiedId={copiedId}
        setExpandedMedia={setExpandedMedia}
        user={user}
        t={t}
        getSpotifyEmbedUrl={getSpotifyEmbedUrl}
        deleteMediaLink={deleteMediaLink}
      />

      {/* Video Section */}
      <VideoMediaGrid
        videoMediaLinks={videoMediaLinks}
        isOwnProfile={isOwnProfile}
        handleCopyLink={handleCopyLink}
        copiedId={copiedId}
        setExpandedMedia={setExpandedMedia}
        user={user}
        t={t}
        deleteMediaLink={deleteMediaLink}
      />

      {/* Modal for expanded media */}
      <MediaModal
        expandedMedia={expandedMedia}
        setExpandedMedia={setExpandedMedia}
        t={t}
        getSpotifyEmbedUrl={getSpotifyEmbedUrl}
      />
    </section>
  );
};

export default MediaSection;
