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


function PostCard({ post }) {

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 w-200 mx-auto">
      <h3 className="text-xl mb-4 font-semibold rounded-lg bg-sky-700 p-4 text-gray-100">{post.title}</h3>

      <div className="bg-sky-100 h-100 w-180 p-4 mx-auto">
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
                  className="w-150 max-h-90 object-contain rounded justify-self-center"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className='font-semibolds'>No images available for this post.</p>
        )}
      </div>
      
      <p className="text-gray-700 bg-white  font-semibold border-gray-300 border-1 mx-auto w-180 p-4 m-4">{post.content}</p> 
    </div>
  );
}

export default PostCard;
