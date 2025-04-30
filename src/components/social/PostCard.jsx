import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from '../profiles/ProfileAvatar';
import { FcLikePlaceholder } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
import { LiaCommentsSolid } from "react-icons/lia";
import { Link } from 'react-router-dom';
import { useView } from '../../context/ViewContext';
import { usePrefetchProfile, useProfileQuery } from '../../context/profile/profileActions';
import ErrorMessage from '../../utils/ErrorMessage';
import Loading from '../../utils/Loading';
import { useLikes } from '../../context/social/LikesContext';
import CommentsBox from './comments/CommentsBox';
import ProfileMinibox from '../profiles/ProfileMinibox';

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



function PostCard({ post }) {
  const { user } = useAuth(); // logged user
  const [isHovered, setIsHovered] = useState(false);
  const { fetchProfile } = useProfile();
  const { data: profile, error, isLoading } = fetchProfile(post.profile_id); // retrive the profile associated with the post
  const { insertLike, deleteLike, userLikes } = useLikes(); // custom hooks to manage the likes
  const { data: likes } = userLikes(user.id); // retrive the likes aassociated with logged user
  const { manageView } = useView(); // manage the views
  const [showMinibox, setShowMinibox] = useState(false); // manage minibox visibility
  const [showComments, setShowComments] = useState(false); // manage comments visibility

  // preferch profile info to view in the minibox
  const prefetchProfile = usePrefetchProfile();

  const handleMouseEnter = () => {
    prefetchProfile(post.profile_id);
    setShowMinibox(true);   
  }

  // like to insert when de user likes a post
  const like = {
    profile_id: user.id,
    post_id: post.id,    
  }

  // find if there is a like associated with this post
  const existingLike = likes?.find(
    (like) => like.post_id === post.id
  );
  
  // boolean that checks if the like exists
  const alreadyLiked = !!existingLike;
  
  // handle the like for every situation
  const handleLikeClick = () => {
    if (alreadyLiked) {
      deleteLike(existingLike);
    } else {
      insertLike(like);
    }
  };
    
  if (error) return <ErrorMessage error={error.message} />

  if (isLoading) return <Loading />
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 mx-auto">  
      {/* title of the post */}
      <h3 className="text-xl mb-4 font-semibold rounded-lg bg-gradient-to-b from-sky-700 to-sky-900 p-4 text-gray-100">{post.title}</h3>

      <div className='flex'>
        <div className='flex flex-col w-50 h-100 items-center'>

          {/* profile avatar */}
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setShowMinibox(false)} 
            className=' relative mb-auto'>
            <Link 
            onClick={() => manageView("about", "profile")} 
            to={`/profile/${profile.id}`}>
              <h2 className="font-bold text-lg">{profile.username}</h2>
              <ProfileAvatar avatar_url={profile.avatar_url} className="!w-15 !h-15 mx-auto" />        
            </Link>
            {showMinibox && <ProfileMinibox profile={profile} isLoading={isLoading} />}
          </div>

          <div>
            {/* like hearts */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleLikeClick}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <motion.div
                key={alreadyLiked ? 'liked' : 'not-liked'}
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
            
            {/* show/hide comments box */}
            <LiaCommentsSolid
            title='Post Comments'
            onClick={() => setShowComments((prev) => !prev)} 
            className={`w-10 h-10 mt-8 cursor-pointer hover:text-sky-800 ${showComments && "text-sky-800"}`} /> 
          </div>
        </div>

        {/* images of the post */}
        <div className="bg-sky-100 h-100 w-140 p-4 ml-auto">
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
                    className="w-110 max-h-90  object-contain rounded justify-self-center"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className='font-semibolds'>No images available for this post.</p>
          )}
        </div>
      </div>
      
      {/* text content of the post */}
      <p className="text-gray-700 bg-white font-semibold border-gray-300 border-1 ml-auto w-140 p-4 my-4">{post.content}</p> 
      {showComments && <CommentsBox postId={post.id} />} 
    </div>
  );
}

export default PostCard;
