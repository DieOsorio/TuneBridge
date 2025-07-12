// --- CONNECTIONS KEY FACTORIES ---
export const CONNECTIONS_KEY = (profileId) => ["connections", profileId];
export const CONNECTION_BETWEEN_KEY = (followerId, followingId) => ["connection-between", followerId, followingId];
export const CONNECTIONS_BETWEEN_MANY_KEY = (userId, followerIds = []) => [
  "connections-between-many",
  userId,
  ...followerIds.sort()
];

export const connectionKeyFactory = ({ follower_profile_id, following_profile_id, multiple_followers } = {}) => ({
  follower: follower_profile_id ? CONNECTIONS_KEY(follower_profile_id) : undefined,
  following: following_profile_id ? CONNECTIONS_KEY(following_profile_id) : undefined,
  between: follower_profile_id && following_profile_id ? CONNECTION_BETWEEN_KEY(follower_profile_id, following_profile_id) : undefined,
  many: follower_profile_id && multiple_followers?.length > 0
    ? CONNECTIONS_BETWEEN_MANY_KEY(follower_profile_id, multiple_followers)
    : undefined,
});

// --- POSTS KEY FACTORIES ---
export const POSTS_KEY = () => ["posts"];
export const USER_POSTS_KEY = (profileId) => ["userPosts", profileId];
export const POST_KEY = (postId) => ["post", postId];
export const POSTS_INFINITE_KEY = () => ["postsInfinite"];
export const SEARCH_POSTS_KEY = (searchTerm) => ["searchPosts", searchTerm];

export const postKeyFactory = ({ postId, profileId, searchTerm } = {}) => ({
  all: POSTS_KEY(),
  user: profileId ? USER_POSTS_KEY(profileId) : undefined,
  single: postId ? POST_KEY(postId) : undefined,
  infinite: POSTS_INFINITE_KEY(),
  search: searchTerm ? SEARCH_POSTS_KEY(searchTerm) : undefined,
});

// --- HASHTAGS KEY FACTORY ---
export const HASHTAGS_ALL_KEY = () => ["hashtags"];
export const hashtagKeyFactory = () => ({
  all: HASHTAGS_ALL_KEY(),
});

// --- POST HASHTAGS KEY FACTORY ---
export const POST_HASHTAGS_KEY = (postId) => ["postHashtags", postId];
export const postHashtagKeyFactory = ({ postId } = {}) => ({
  all: postId ? POST_HASHTAGS_KEY(postId) : undefined,
});

// --- PROFILE HASHTAGS KEY FACTORY ---
export const PROFILE_HASHTAGS_KEY = (profileId) => ["profileHashtags", profileId];
export const profileHashtagKeyFactory = ({ profileId } = {}) => ({
  all: profileId ? PROFILE_HASHTAGS_KEY(profileId) : undefined,
});

// --- NOTIFICATIONS KEY FACTORY ---
export const USER_NOTIFICATIONS_KEY = (profileId) => ["userNotifications", profileId];
export const NOTIFICATION_KEY = (notificationId) => ["notification", notificationId];
export const notificationKeyFactory = ({ profileId, id } = {}) => ({
  all: profileId ? USER_NOTIFICATIONS_KEY(profileId) : undefined,
  single: id ? NOTIFICATION_KEY(id) : undefined,
});

// --- LIKES KEY FACTORY ---
export const LIKES_KEY = () => ["likes"];
export const COMMENT_LIKES_KEY = (commentId) => ["commentLikes", commentId];
export const USER_LIKES_KEY = (profileId) => ["userLikes", profileId];
export const POST_LIKES_KEY = (postId) => ["postLikes", postId];
export const USER_LIKED_POST_KEY = (postId, profileId) => ["userLikedPost", postId, profileId];
export const likeKeyFactory = ({ commentId, profileId, postId } = {}) => ({
  all: LIKES_KEY(),
  comment: commentId ? COMMENT_LIKES_KEY(commentId) : undefined,
  user: profileId ? USER_LIKES_KEY(profileId) : undefined,
  post: postId ? POST_LIKES_KEY(postId) : undefined,
  userPost: postId && profileId ? USER_LIKED_POST_KEY(postId, profileId) : undefined,
});

// --- COMMENTS KEY FACTORY ---
export const COMMENTS_KEY = (postId) => ["comments", postId];
export const commentKeyFactory = ({ postId } = {}) => ({
  all: postId ? COMMENTS_KEY(postId) : undefined,
});

// --- CHAT ---
// --- PARTICIPANTS KEY FACTORY ---
export const PARTICIPANTS_KEY = (conversationId) => ["participants", conversationId];
export const participantKeyFactory = ({ conversationId } = {}) => ({
  all: conversationId ? PARTICIPANTS_KEY(conversationId) : undefined,
});

// --- MESSAGES KEY FACTORY ---
export const MESSAGES_KEY = (conversationId) => ["messages", conversationId];
export const TOTAL_UNREAD_MESSAGES_KEY = (profileId) => ["total-unread-messages", profileId];
export const UNREAD_MESSAGES_KEY = (conversationId, profileId) => ["unread-messages", conversationId, profileId];
export const messageKeyFactory = ({ conversationId, profileId } = {}) => ({
  all: conversationId ? MESSAGES_KEY(conversationId) : undefined,
  totalUnread: profileId ? TOTAL_UNREAD_MESSAGES_KEY(profileId) : undefined,
  unread: conversationId && profileId ? UNREAD_MESSAGES_KEY(conversationId, profileId) : undefined,
});

// --- CONVERSATIONS KEY FACTORY ---
export const CONVERSATIONS_KEY = (profileId) => ["conversations", profileId];
export const CONVERSATION_KEY = (conversationId) => ["conversation", conversationId];
export const conversationKeyFactory = ({ id, createdBy, profileId } = {}) => ({
  all: profileId ? CONVERSATIONS_KEY(profileId) : createdBy ? CONVERSATIONS_KEY(createdBy) : undefined,
  single: id ? CONVERSATION_KEY(id) : undefined,
});

// --- MUSICIAN ADS KEY FACTORY ---
export const MUSICIAN_ADS_KEY = () => ["musicianAds"];
export const MUSICIAN_AD_KEY = (adId) => ["musicianAd", adId];
export const USER_MUSICIAN_ADS_KEY = (profileId) => ["userMusicianAds", profileId];
export const GROUP_MUSICIAN_ADS_KEY = (groupId) => ["groupMusicianAds", groupId];
export const MUSICIAN_ADS_SEARCH_KEY = (query) => ["searchMusicianAds", query];

export const musicianAdKeyFactory = ({ adId, profileId, groupId, searchTerm } = {}) => ({
  all: MUSICIAN_ADS_KEY(),
  single: adId ? MUSICIAN_AD_KEY(adId) : undefined,
  user: profileId ? USER_MUSICIAN_ADS_KEY(profileId) : undefined,
  group: groupId ? GROUP_MUSICIAN_ADS_KEY(groupId) : undefined,
  search: searchTerm ? MUSICIAN_ADS_SEARCH_KEY(searchTerm) : undefined,
});
