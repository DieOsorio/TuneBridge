import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from '../profiles/ProfileAvatar';
import { FcLikePlaceholder } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
import { LiaCommentsSolid } from "react-icons/lia";
import { Link, useNavigate } from 'react-router-dom';
import { useView } from '../../context/ViewContext';
import { usePrefetchProfile, useProfileQuery } from '../../context/profile/profileActions';
import ErrorMessage from '../../utils/ErrorMessage';
import Loading from '../../utils/Loading';
import { useLikes } from '../../context/social/LikesContext';
import CommentsBox from './comments/CommentsBox';
import ProfileMinibox from '../profiles/ProfileMinibox';
import { AiOutlineClose } from "react-icons/ai"; // Import the close icon

// for animations
import { motion } from 'framer-motion';

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/zoom';
import 'swiper/css/effect-coverflow';
import { useProfile } from '../../context/profile/ProfileContext';
import { FaEdit } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useHashtags } from '../../context/social/HashtagsContext';
import { usePostHashtags } from '../../context/social/PostHashtagsContext';

function PostCard({ post }) {
  const { t } = useTranslation("posts")
  const { user } = useAuth(); // logged user
  const navigate = useNavigate(); // For navigation

  const [isHovered, setIsHovered] = useState(false);
  const { fetchProfile } = useProfile();
  const { data: profile, error, isLoading } = fetchProfile(post.profile_id); // retrieve the profile associated with the post
  const { insertLike, deleteLike, userLikes } = useLikes(); // custom hooks to manage the likes
  const { data: likes } = userLikes(user.id); // retrieve the likes associated with logged user
  const { manageView } = useView(); // manage the views
  const { getHashtagsByPostId } = usePostHashtags(); // fetch post hashtags
  const { data: hashtags } = getHashtagsByPostId(post.id); // retrieve hashtags associated with the post
  const [showMinibox, setShowMinibox] = useState(false); // manage minibox visibility
  const [showComments, setShowComments] = useState(false); // manage comments visibility
  const [isModalOpen, setIsModalOpen] = useState(false); // manage modal visibility
  const [currentImage, setCurrentImage] = useState(null); // current image in modal
  
  // Prefetch profile info to view in the minibox
  const prefetchProfile = usePrefetchProfile();

  const handleMouseEnter = () => {
    prefetchProfile(post.profile_id);
    setShowMinibox(true);
  };

  // Like to insert when the user likes a post
  const like = {
    profile_id: user.id,
    post_id: post.id,
  };

  // Find if there is a like associated with this post
  const existingLike = likes?.find((like) => like.post_id === post.id);

  // Boolean that checks if the like exists
  const alreadyLiked = !!existingLike;

  // Handle the like for every situation
  const handleLikeClick = () => {
    if (alreadyLiked) {
      deleteLike(existingLike);
    } else {
      insertLike(like);
    }
  };

  // Navigate to the edit page
  const handleEditClick = () => {
    navigate(`/edit-post/${post.id}`);
  };

  // Open modal for image
  const openModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  if (error) return <ErrorMessage error={error.message} />;

  if (isLoading) return <Loading />;

  return (
    <div className="bg-gradient-to-l to-gray-800 p-4 rounded-lg shadow-md mb-4 mx-auto max-w-3xl w-full">
      {/* Title of the post */}
      <h3 className="text-xl mb-4 font-semibold rounded-lg bg-gradient-to-l to-sky-600 p-4 text-gray-100">
        {post.title}
      </h3>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex sm:flex-col flex-row items-center">
          {/* Profile avatar */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowMinibox(false)}
            className="relative mb-auto"
          >
            <Link
              onClick={() => manageView("about", "profile")}
              to={`/profile/${profile.id}`}
            >
              <h2 className="font-bold text-lg text-gray-200">
                {profile.username}
              </h2>
              <ProfileAvatar
                avatar_url={profile.avatar_url}
                className="!w-15 !h-15 mx-auto"
                gender={profile.gender}
                alt={`${profile.username}'s avatar`}
              />
            </Link>
            {showMinibox && (
              <ProfileMinibox profile={profile} isLoading={isLoading} />
            )}
          </div>

          {/* Utility buttons */}
          <div className="flex sm:h-full sm:justify-end sm:flex-col items-end ml-auto sm:ml-0 gap-8 mt-6">
          
            {/* Edit button for the logged-in user's posts */}
            <div className="w-10 h-10 flex items-center justify-center">
              {post.profile_id === user.id && (
                <FaEdit
                  title="Edit Post"
                  className="text-yellow-600 hover:text-yellow-700 cursor-pointer" 
                  onClick={handleEditClick} 
                  size={40}
                />
              )}
            </div>

            {/* Like hearts */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleLikeClick}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <motion.div
                key={alreadyLiked ? "liked" : "not-liked"}
                initial={{ scale: 1 }}
                animate={{ scale: alreadyLiked ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.4 }}
              >
                {alreadyLiked || isHovered ? (
                  <FcLike className="w-10 h-10" />
                ) : (
                  <FcLikePlaceholder className="w-10 h-10" />
                )}
              </motion.div>
            </div>

            {/* Show/hide comments box */}
            <LiaCommentsSolid
              size={40}
              title="Post Comments"
              onClick={() => setShowComments((prev) => !prev)}
              className={`text-gray-400 cursor-pointer hover:text-sky-600 ${
                showComments && "text-sky-600"
              }`}
            />
          </div>
        </div>


        {/* Images of the post */}
        <div className="w-full max-w-[600px] mx-auto p-4 bg-gradient-to-l from-gray-900 rounded-md">
          {post.images_urls && post.images_urls.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, Zoom]}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
            >
              {post.images_urls.map((url, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={url}
                    alt={`Post image ${index}`}
                    className="w-full max-h-[400px] sm:max-h-[500px] object-contain rounded cursor-pointer"
                    onClick={() => openModal(url)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="font-semibold text-center text-white">
              {t('messages.noImages')}
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
              <AiOutlineClose size={28} />
            </button>

            {/* Image */}
            <img
              src={currentImage}
              alt="Full-size post image"
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-md shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Hashtags */}
        <div className="flex gap-2 mt-4 sm:mt-0 justify-center">
          {hashtags && hashtags.length > 0 && (
            hashtags.map((hashtag) => (
              <Link
                key={hashtag.id}
                // to={`/hashtag/${hashtag.hashtags.name}`}
                className="text-sm text-sky-500 hover:underline"
              >
                {hashtag.hashtags.name}
              </Link>
            ))
          )}
        </div>

      {/* Text content of the post */}
      <p className="text-gray-300 mx-auto rounded-md bg-gray-900 font-semibold border-sky-700 border-1 sm:ml-auto sm:w-140 p-4 my-4">
        {post.content}
      </p>

      {showComments && <CommentsBox postId={post.id} />}
    </div>
  );
}

export default PostCard;
