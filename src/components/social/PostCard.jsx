import { useState } from 'react';
import ProfileAvatar from '../profiles/ProfileAvatar';
import { FcLikePlaceholder } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
import { LiaCommentsSolid } from "react-icons/lia";

// import Swiper core and required modules
import { Navigation, Pagination, Scrollbar, Zoom, EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/zoom';
import 'swiper/css/effect-coverflow';
import { Link } from 'react-router-dom';
import { useView } from '../../context/ViewContext';
import { useProfileQuery } from '../../context/profile/profileActions';
import ErrorMessage from '../../utils/ErrorMessage';
import Loading from '../../utils/Loading';



function PostCard({ post }) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: profile, error, isLoading } = useProfileQuery(post.profile_id);
  const { setExternalView } = useView();

  if (error) return <ErrorMessage error={error.message} />

  if (isLoading) return <Loading />

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-200 mx-auto">
      <h3 className="text-xl mb-4 font-semibold rounded-lg bg-sky-700 p-4 text-gray-100">{post.title}</h3>
      <div className='flex'>
        <div className='flex flex-col w-50 h-100 items-center'>
          
          <div className='mb-auto'>
            <Link onClick={() => setExternalView("profile")} to={`/profile/${profile.id}`}>
              <h2 className="font-bold text-lg">{profile.username}</h2>
              <ProfileAvatar avatar_url={profile.avatar_url} className="!w-15 !h-15 mx-auto" />        
            </Link>
          </div>
          <div>
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              {isHovered ? (
                <FcLike className='w-10 h-10' />
              ) : (
                <FcLikePlaceholder className='w-10 h-10' />
              )}
            </div>

            <LiaCommentsSolid className='w-10 h-10 mt-8 cursor-pointer' /> 
          </div>
        </div>
        <div className="bg-sky-100 h-100 w-140 p-4 ml-auto">
          {post.images_urls && post.images_urls.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, Zoom, EffectCoverflow]}
              slidesPerView={1}
              navigation
              zoom
              effectCoverflow={{
                  rotate: 50,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
              }}
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
      
      
      <p className="text-gray-700 bg-white font-semibold border-gray-300 border-1 ml-auto w-140 p-4 my-4">{post.content}</p> 
    </div>
  );
}

export default PostCard;
