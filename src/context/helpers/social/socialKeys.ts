
// --- CONNECTIONS KEY FACTORIES ---
export type ConnectionKeyFactoryParams = {
  follower_profile_id?: string;
  following_profile_id?: string;
  multiple_followers?: string[];
};
export const CONNECTIONS_KEY = (profileId: string): ["connections", string] => ["connections", profileId];
export const CONNECTION_BETWEEN_KEY = (followerId: string, followingId: string): ["connection-between", string, string] => ["connection-between", followerId, followingId];
export const CONNECTIONS_BETWEEN_MANY_KEY = (userId: string, followerIds: string[] = []): ["connections-between-many", string, ...string[]] => [
  "connections-between-many",
  userId,
  ...followerIds.sort()
];
export const connectionKeyFactory = ({ follower_profile_id, following_profile_id, multiple_followers }: ConnectionKeyFactoryParams = {}): {
  follower?: ["connections", string];
  following?: ["connections", string];
  between?: ["connection-between", string, string];
  many?: ["connections-between-many", string, ...string[]];
} => ({
  follower: follower_profile_id ? CONNECTIONS_KEY(follower_profile_id) : undefined,
  following: following_profile_id ? CONNECTIONS_KEY(following_profile_id) : undefined,
  between: follower_profile_id && following_profile_id ? CONNECTION_BETWEEN_KEY(follower_profile_id, following_profile_id) : undefined,
  many: follower_profile_id && Array.isArray(multiple_followers) && multiple_followers.length > 0
    ? CONNECTIONS_BETWEEN_MANY_KEY(follower_profile_id, multiple_followers)
    : undefined,
});

// --- POSTS KEY FACTORIES ---
export type PostKeyFactoryParams = {
  postId?: string;
  profileId?: string;
  searchTerm?: string;
};
export const POSTS_KEY = (): ["posts"] => ["posts"];
export const USER_POSTS_KEY = (profileId: string): ["userPosts", string] => ["userPosts", profileId];
export const POST_KEY = (postId: string): ["post", string] => ["post", postId];
export const POSTS_INFINITE_KEY = (): ["postsInfinite"] => ["postsInfinite"];
export const SEARCH_POSTS_KEY = (searchTerm: string): ["searchPosts", string] => ["searchPosts", searchTerm];
export const postKeyFactory = ({ postId, profileId, searchTerm }: PostKeyFactoryParams = {}): {
  all: ["posts"];
  user?: ["userPosts", string];
  single?: ["post", string];
  infinite: ["postsInfinite"];
  search?: ["searchPosts", string];
} => ({
  all: POSTS_KEY(),
  user: profileId ? USER_POSTS_KEY(profileId) : undefined,
  single: postId ? POST_KEY(postId) : undefined,
  infinite: POSTS_INFINITE_KEY(),
  search: searchTerm ? SEARCH_POSTS_KEY(searchTerm) : undefined,
});

// --- HASHTAGS KEY FACTORY ---
export const HASHTAGS_ALL_KEY = (): ["hashtags"] => ["hashtags"];
export const hashtagKeyFactory = (): { all: ["hashtags"] } => ({
  all: HASHTAGS_ALL_KEY(),
});

// --- POST HASHTAGS KEY FACTORY ---
export type PostHashtagKeyFactoryParams = { postId?: string };
export const POST_HASHTAGS_KEY = (postId: string): ["postHashtags", string] => ["postHashtags", postId];
export const postHashtagKeyFactory = ({ postId }: PostHashtagKeyFactoryParams = {}): { all?: ["postHashtags", string] } => ({
  all: postId ? POST_HASHTAGS_KEY(postId) : undefined,
});

// --- PROFILE HASHTAGS KEY FACTORY ---
export type ProfileHashtagKeyFactoryParams = { profileId?: string };
export const PROFILE_HASHTAGS_KEY = (profileId: string): ["profileHashtags", string] => ["profileHashtags", profileId];
export const profileHashtagKeyFactory = ({ profileId }: ProfileHashtagKeyFactoryParams = {}): { all?: ["profileHashtags", string] } => ({
  all: profileId ? PROFILE_HASHTAGS_KEY(profileId) : undefined,
});

// --- NOTIFICATIONS KEY FACTORY ---
export type NotificationKeyFactoryParams = { profileId?: string; id?: string };
export const USER_NOTIFICATIONS_KEY = (profileId: string): ["userNotifications", string] => ["userNotifications", profileId];
export const NOTIFICATION_KEY = (notificationId: string): ["notification", string] => ["notification", notificationId];
export const notificationKeyFactory = ({ profileId, id }: NotificationKeyFactoryParams = {}): {
  all?: ["userNotifications", string];
  single?: ["notification", string];
} => ({
  all: profileId ? USER_NOTIFICATIONS_KEY(profileId) : undefined,
  single: id ? NOTIFICATION_KEY(id) : undefined,
});

// --- LIKES KEY FACTORY ---
export type LikeKeyFactoryParams = { commentId?: string; profileId?: string; postId?: string };
export const LIKES_KEY = (): ["likes"] => ["likes"];
export const COMMENT_LIKES_KEY = (commentId: string): ["commentLikes", string] => ["commentLikes", commentId];
export const USER_LIKES_KEY = (profileId: string): ["userLikes", string] => ["userLikes", profileId];
export const POST_LIKES_KEY = (postId: string): ["postLikes", string] => ["postLikes", postId];
export const USER_LIKED_POST_KEY = (postId: string, profileId: string): ["userLikedPost", string, string] => ["userLikedPost", postId, profileId];
export const likeKeyFactory = ({ commentId, profileId, postId }: LikeKeyFactoryParams = {}): {
  all: ["likes"];
  comment?: ["commentLikes", string];
  user?: ["userLikes", string];
  post?: ["postLikes", string];
  userPost?: ["userLikedPost", string, string];
} => ({
  all: LIKES_KEY(),
  comment: commentId ? COMMENT_LIKES_KEY(commentId) : undefined,
  user: profileId ? USER_LIKES_KEY(profileId) : undefined,
  post: postId ? POST_LIKES_KEY(postId) : undefined,
  userPost: postId && profileId ? USER_LIKED_POST_KEY(postId, profileId) : undefined,
});

// --- COMMENTS KEY FACTORY ---
export type CommentKeyFactoryParams = { postId?: string };
export const COMMENTS_KEY = (postId: string): ["comments", string] => ["comments", postId];
export const commentKeyFactory = ({ postId }: CommentKeyFactoryParams = {}): { all?: ["comments", string] } => ({
  all: postId ? COMMENTS_KEY(postId) : undefined,
});

// --- CHAT ---
// --- PARTICIPANTS KEY FACTORY ---
export type ParticipantKeyFactoryParams = { conversationId?: string };
export const PARTICIPANTS_KEY = (conversationId: string): ["participants", string] => ["participants", conversationId];
export const participantKeyFactory = ({ conversationId }: ParticipantKeyFactoryParams = {}): { all?: ["participants", string] } => ({
  all: conversationId ? PARTICIPANTS_KEY(conversationId) : undefined,
});

// --- MESSAGES KEY FACTORY ---
export type MessageKeyFactoryParams = { conversationId?: string; profileId?: string; id?: string };

export const MESSAGES_KEY = (conversationId: string): ["messages", string] => ["messages", conversationId];
export const TOTAL_UNREAD_MESSAGES_KEY = (profileId: string): ["total-unread-messages", string] => ["total-unread-messages", profileId];
export const UNREAD_MESSAGES_KEY = (conversationId: string, profileId: string): ["unread-messages", string, string] =>
  ["unread-messages", conversationId, profileId];
export const SINGLE_MESSAGE_KEY = (conversationId: string, id: string): ["message", string, string] =>
  ["message", conversationId, id];

export const messageKeyFactory = ({ conversationId, profileId, id }: MessageKeyFactoryParams = {}) => ({
  all: conversationId ? MESSAGES_KEY(conversationId) : undefined,
  totalUnread: profileId ? TOTAL_UNREAD_MESSAGES_KEY(profileId) : undefined,
  unread: conversationId && profileId ? UNREAD_MESSAGES_KEY(conversationId, profileId) : undefined,
  single: conversationId && id ? SINGLE_MESSAGE_KEY(conversationId, id) : undefined,
});

// --- CONVERSATIONS KEY FACTORY ---
export type ConversationKeyFactoryParams = { id?: string; createdBy?: string; profileId?: string };
export const CONVERSATIONS_KEY = (profileId: string): ["conversations", string] => ["conversations", profileId];
export const CONVERSATION_KEY = (conversationId: string): ["conversation", string] => ["conversation", conversationId];
export const conversationKeyFactory = ({ id, createdBy, profileId }: ConversationKeyFactoryParams = {}): {
  all?: ["conversations", string];
  single?: ["conversation", string];
} => ({
  all: profileId ? CONVERSATIONS_KEY(profileId) : createdBy ? CONVERSATIONS_KEY(createdBy) : undefined,
  single: id ? CONVERSATION_KEY(id) : undefined,
});

// --- MUSICIAN ADS KEY FACTORY ---
export type MusicianAdKeyFactoryParams = { adId?: string; profileId?: string; groupId?: string; searchTerm?: string };
export const MUSICIAN_ADS_KEY = (): ["musicianAds"] => ["musicianAds"];
export const MUSICIAN_AD_KEY = (adId: string): ["musicianAd", string] => ["musicianAd", adId];
export const USER_MUSICIAN_ADS_KEY = (profileId: string): ["userMusicianAds", string] => ["userMusicianAds", profileId];
export const GROUP_MUSICIAN_ADS_KEY = (groupId: string): ["groupMusicianAds", string] => ["groupMusicianAds", groupId];
export const MUSICIAN_ADS_SEARCH_KEY = (query: string): ["searchMusicianAds", string] => ["searchMusicianAds", query];
export const musicianAdKeyFactory = ({ adId, profileId, groupId, searchTerm }: MusicianAdKeyFactoryParams = {}): {
  all: ["musicianAds"];
  single?: ["musicianAd", string];
  user?: ["userMusicianAds", string];
  group?: ["groupMusicianAds", string];
  search?: ["searchMusicianAds", string];
} => ({
  all: MUSICIAN_ADS_KEY(),
  single: adId ? MUSICIAN_AD_KEY(adId) : undefined,
  user: profileId ? USER_MUSICIAN_ADS_KEY(profileId) : undefined,
  group: groupId ? GROUP_MUSICIAN_ADS_KEY(groupId) : undefined,
  search: searchTerm ? MUSICIAN_ADS_SEARCH_KEY(searchTerm) : undefined,
});
