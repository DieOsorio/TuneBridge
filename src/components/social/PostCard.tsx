import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { usePrefetchProfile } from "@/context/profile/profileActions";
import { useLikes } from "@/context/social/LikesContext";
import { useProfileGroups } from "@/context/profile/ProfileGroupsContext";
import { useProfileGroupMembers } from "@/context/profile/ProfileGroupMembersContext";
import { useProfile } from "@/context/profile/ProfileContext";
import { usePostHashtags } from "@/context/social/PostHashtagsContext";

import ProfileAvatar from "../profiles/ProfileAvatar";
import ProfileMinibox from "../profiles/ProfileMinibox";
import CommentsBox from "./comments/CommentsBox";
import ErrorMessage from "../../utils/ErrorMessage";

import { motion } from "framer-motion";
import { Navigation, Pagination, Scrollbar, Zoom } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  XMarkIcon,
  PencilSquareIcon,
  HeartIcon
} from "@heroicons/react/24/solid";
import { LiaCommentsSolid } from "react-icons/lia";

import type { Post } from "@/context/social/postsActions"
import type { Profile } from "@/context/profile/profileActions"
import type { ProfileGroup } from "@/context/profile/profileGroupsActions"

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "swiper/css/effect-coverflow";

interface TooltipProps {
  children: ReactNode;
}

const Tooltip = ({ children }: TooltipProps) => (
  <div
    className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2
               whitespace-nowrap rounded-md bg-gray-900/90 py-1 px-2 text-xs
               font-semibold text-sky-200 shadow-lg backdrop-blur"
  >
    {children}
    {/* arrow */}
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-gray-900/90" />
  </div>
);

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation("posts");
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [showMinibox, setShowMinibox] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const { fetchProfile } = useProfile();
  const { data: profile, error, isLoading } = fetchProfile(post.profile_id);

  const isGroupPost = Boolean(post.group_id);
  const { fetchProfileGroup } = useProfileGroups();
  const { data: group, isLoading: isGroupLoading } = fetchProfileGroup(post.group_id ?? "");

  const { userGroupRole } = useProfileGroupMembers();

  const { data: role, isLoading: isRoleLoading } = userGroupRole({
    profileId: user?.id ?? "",
    groupId: post.group_id ?? "",
  });

  const author: Profile | ProfileGroup | undefined | null  = isGroupPost ? group : profile;

  const {
    insertLike,
    deleteLike,
    userLikedPostQuery,
    postLikesQuery,
  } = useLikes();

  const { data: existingLike } = loggedIn
  ? userLikedPostQuery(
      post.id,
      user!.id
    )
  : {data: undefined};

  const { data: postlikes = [] } = postLikesQuery(post.id);
  const likesCount = postlikes.length;

  const { getHashtagsByPostId } = usePostHashtags();
  const { data: hashtags } = getHashtagsByPostId(post.id);

  const likeLabel = t("likes.count", { count: likesCount });
  const loading = isGroupLoading || isRoleLoading || isLoading;

  // Prefetch profile info to view in the minibox
  const prefetchProfile = usePrefetchProfile();

  const handleMouseEnter = () => {
    prefetchProfile(post.profile_id);
    setShowMinibox(true);
  };

  const like = loggedIn
    ? { profile_id: user?.id, post_id: post.id }
    : null;

  const alreadyLiked = !!existingLike;

  const handleLikeClick = () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (alreadyLiked) {
      deleteLike({
        ...existingLike!,
        post_id: post.id,
        profile_id: user?.id || "",
      });
    } else {
      if (like) insertLike(like);
    }
  };

  const handleEditClick = () => {
    navigate(`/edit-post/${post.id}`);
  };

  const openModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  const handleShowComments = () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    setShowComments((prev) => !prev);
  };

  if (error) return <ErrorMessage error={error.message} />;

  const userIsOwnerOfPost = post.profile_id === user?.id;
  const userCanEditGroupPost = role === "admin" || role === "manager";

  const canEditPost =
    loggedIn &&
    ((!isGroupPost && userIsOwnerOfPost) || (isGroupPost && userCanEditGroupPost));

  return (
    <div className="bg-gradient-to-l to-gray-800 p-4 rounded-lg shadow-md mb-4 mx-auto max-w-3xl w-full">
      {/* Title of the post */}
      <h3
        className={`text-xl mb-4 font-semibold rounded-lg bg-gradient-to-l ${
          isGroupPost ? "to-amber-700" : "to-sky-600"
        } p-4 text-gray-100`}
      >
        {post.title}
      </h3>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex sm:flex-col flex-row items-center">
          {/* Profile avatar */}
          {author && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowMinibox(false)}
              className="relative mb-auto"
            >
              <Link
                to={
                  isGroupPost
                    ? `/group/${author.id ?? ""}`
                    : `/profile/${author.id ?? ""}`
                }
              >
                <h2 className="font-bold text-lg text-gray-200">
                  {"username" in author ? author.username : author.name}
                </h2>
                <ProfileAvatar
                  avatar_url={author.avatar_url}
                  className="!w-15 !h-15 mx-auto"
                  gender={"gender" in author ? author.gender : undefined}
                  alt={`${
                    "username" in author ? author.username : author.name
                  }'s avatar`}
                />
              </Link>
              {showMinibox && (
                <ProfileMinibox
                  profile={author}
                  isLoading={loading}
                  isGroup={isGroupPost}
                />
              )}
            </div>
          )}

          {/* Utility buttons */}
          <div className="flex sm:h-full sm:justify-end sm:flex-col items-end ml-auto sm:ml-0 gap-3 sm:gap-8 mt-6">
            {/* Edit button for the logged-in user's posts */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              {canEditPost && (
                <PencilSquareIcon
                  title={t("titles.updatePost")}
                  className="text-yellow-600 w-8 h-8 hover:text-yellow-700 cursor-pointer"
                  onClick={handleEditClick}
                />
              )}
            </div>
            {/* Like hearts */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleLikeClick}
              className="relative cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <motion.div
                key={alreadyLiked ? "liked" : "not-liked"}
                initial={{ scale: 1 }}
                animate={{ scale: alreadyLiked ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                {alreadyLiked || isHovered ? (
                  <HeartIcon 
                    className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600 transition-all" 
                  />
                ) : (
                  <HeartIcon className="w-8 h-8 sm:w-10 sm:h-10 text-rose-300" />
                )}
                {isHovered && <Tooltip>{likeLabel}</Tooltip>}
              </motion.div>
            </div>
            {/* Show/hide comments box */}
            <LiaCommentsSolid
              title= {t("titles.comments")}
              onClick={handleShowComments}
              className={`text-gray-400 cursor-pointer w-8 h-8 transition-all ${
                isGroupPost ? "hover:text-amber-700" : "hover:text-sky-600"
              } ${
                showComments && !isGroupPost
                  ? "text-sky-600"
                  : "text-amber-700"
              } sm:!w-10 sm:!h-10`}
            />
          </div>
        </div>

        {/* Images of the post */}
        {/* Desktop/Tablet Swiper */}
        <div className="w-full max-w-[600px] flex-1 mx-auto bg-gradient-to-l from-gray-900 rounded-md hidden sm:flex">
          {post.images_urls && post.images_urls.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, Zoom]}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              style={{ width: "100%", height: "100%" }}
            >
              {(post.images_urls as string[]).map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Post image ${index}`}
                    className="w-full max-h-[500px] object-contain rounded cursor-pointer"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                    }}
                    onClick={() => openModal(url)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="font-semibold m-auto text-center text-gray-400">
              {t("messages.noImages")}
            </p>
          )}
        </div>
        {/* Mobile Image Displayer */}
        <div className="w-full mx-auto p-0 bg-gradient-to-l from-gray-900 rounded-md block sm:hidden">
          {post.images_urls && post.images_urls.length > 0 ? (
            post.images_urls.length === 1 ? (
              <img
                src={post.images_urls[0]}
                alt="Post image"
                className="w-full h-[60vw] min-h-[180px] max-h-[70vh] object-contain rounded cursor-pointer"
                onClick={() => post.images_urls && openModal(post.images_urls[0])}
              />
            ) : (
              <Swiper
                modules={[Pagination, Scrollbar, Zoom]}
                slidesPerView={1}
                pagination={{ clickable: true }}
                scrollbar={{ draggable: true }}
                style={{ minHeight: "60vw", maxHeight: "70vh" }}
              >
                {(post.images_urls as string[]).map((url, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={url}
                      alt={`Post image ${index}`}
                      className="w-full h-full min-h-[180px] max-h-[70vh] object-contain rounded cursor-pointer"
                      onClick={() => openModal(url)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          ) : (
            <p className="font-semibold text-center text-white">
              {t("messages.noImages")}
            </p>
          )}
        </div>
      </div>
      {/* Modal for full-size image */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative max-w-full max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-1 right-1 text-white hover:text-red-100 cursor-pointer z-10"
              onClick={closeModal}
            >
              <XMarkIcon className="w-7 h-7" />
            </button>

            {/* Image */}
            <img
              src={currentImage ?? undefined}
              alt="Full-size post image"
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-md shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Hashtags */}
      {hashtags &&
        hashtags.length > 0 &&
        hashtags
          .filter((h) => h.hashtags !== undefined)
          .map((hashtag) => {
            const name = hashtag.hashtags!.name;
            const tagName = name.startsWith("#") ? name.slice(1) : name;
            return (
              <Link
                key={hashtag.hashtag_id}
                to={`/hashtag/${tagName}`}
                className="text-sm mx-1 text-sky-500 hover:underline"
              >
                {name}
              </Link>
            );
          })}

      {/* Text content of the post */}
      <p
        className={`text-gray-300 mx-auto rounded-md bg-gray-900 font-semibold border-1 sm:ml-auto sm:w-140 p-4 my-4 ${
          isGroupPost ? "border-amber-700" : "border-sky-700"
        }`}
      >
        {post.content}
      </p>

      {showComments && <CommentsBox postId={post.id} />}
    </div>
  );
}

export default PostCard;
