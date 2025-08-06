 export const getSpotifyEmbedUrl = (url: string): string | null => {
    const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    const [_, type, spotifyId] = match;
    return `https://open.spotify.com/embed/${type}/${spotifyId}`;
  };

  export const isValidMediaUrl = (url: string, mediaType: string): boolean => {
    if (!url || !mediaType) return false;
    switch (mediaType) {
      case "spotify":
        return /spotify\.com\/(track|playlist|album)\/[a-zA-Z0-9]+/.test(url);
      case "youtube":
        return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}/.test(url);
      case "vimeo":
        return /vimeo\.com\/\d+/.test(url);
      case "soundcloud":
        return /soundcloud\.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+/.test(url);
      case "file":
        return /\.(mp3|mp4|wav|ogg|webm)$/i.test(url);
      default:
        return false;
    }
  };