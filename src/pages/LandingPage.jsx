import { FaMusic, FaHandshake, FaMicrophoneAlt } from "react-icons/fa"; // Importing icons
import { motion } from "framer-motion"; // For animations
import Skeleton from "react-loading-skeleton"; // For skeleton loaders
import "react-loading-skeleton/dist/skeleton.css"; // Skeleton styles
import Banner from "../components/ui/Banner";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Swiper imports for carousel
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";


const LandingPage = () => {
  const { t } = useTranslation("ui");
  const { user } = useAuth();
  const isLoading = false; // Simulate loading state for skeletons

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Get how it works steps from i18n
  const howItWorks = t("landingpage.howItWorks.steps", { returnObjects: true });
  const features = t("landingpage.features.cards", { returnObjects: true });

  // Get screenshots sections from i18n
  const screenshotSections = ["profile", "chat", "explore", "posts"];
  const screenshotsData = screenshotSections.map(section => {
  const images = t(`landingpage.screenshots.${section}.images`, { returnObjects: true });
    // Ensure images is always an array
    return {
      key: section,
      title: t(`landingpage.screenshots.${section}.title`),
      description: t(`landingpage.screenshots.${section}.description`),
      images: Array.isArray(images) ? images : []
    };
  });
  const screenshotsSectionTitle = t("landingpage.screenshots.sectionTitle");
  const screenshotsSectionDescription = t("landingpage.screenshots.description");

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

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Banner
          title={t("landingpage.hero.title")}
          subtitle={t("landingpage.hero.subtitle")}
          backgroundImage="/rhythmic-hands-drumming-stockcake.jpg"
          button= {t("landingpage.callToAction.buttons.joinUs")}
          user={user}
        />
      </motion.div>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-16 bg-gradient-to-r from-gray-900 to-sky-950">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {t("landingpage.features.sectionTitle")}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <FeatureCardSkeleton />
              <FeatureCardSkeleton />
              <FeatureCardSkeleton />
            </>
          ) : (
            <>
              {features.map(({ title, description}, i) => (
                <FeatureCard 
                  key={i}
                  icon={
                    i === 0 ? <FaMusic className="text-sky-500 mx-auto" /> :
                    i === 1 ? <FaHandshake className="text-green-400 mx-auto" /> :
                    <FaMicrophoneAlt className="text-purple-400 mx-auto" />
                  }
                  title={title}
                  description={description}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {/* How It Works Section (Responsive Table Style) */}
      <motion.section
        className="py-16 px-6 md:px-16 bg-gradient-to-r from-sky-950"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {t("landingpage.howItWorks.sectionTitle")}
        </motion.h2>
        {/* Table layout for md+ screens, column for mobile */}
        <div className="relative">
          {/* Blue border under h3s, spanning all steps (md+ only) */}
          <div className="hidden md:block absolute left-0 right-0 top-[76px] h-0.5 bg-sky-950 z-0" style={{marginLeft: '6%', marginRight: '6%'}} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <Step number={idx + 1} title={step.title} description={step.description} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* App Screenshots Feature Blocks Section */}
      <section className="hidden sm:block py-16 px-6 md:px-16 bg-gradient-to-r from-gray-900 to-sky-950">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          {screenshotsSectionTitle}
        </h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto text-lg">
          {screenshotsSectionDescription}
        </p>
        <div className="flex flex-col gap-16">
          {screenshotsData.map(({ key, title, description, images }) => (
            <div key={key} className="w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-sky-300 mb-2 text-center">{title}</h3>
              <p className="text-center text-gray-300 mb-6 max-w-2xl mx-auto">{description}</p>
              {/* Tablet/Desktop: Swiper carousel only */}
              <div className="hidden sm:block max-w-4xl mx-auto w-full">
                {images.length > 0 && (
                  <Swiper
                    modules={[Navigation, Pagination, A11y, EffectCoverflow]}
                    effect="coverflow"
                    coverflowEffect={{
                      rotate: 30,
                      stretch: 0,
                      depth: 200,
                      modifier: 1,
                      slideShadows: true,
                    }}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    centeredSlides={true}
                    className="rounded-xl shadow-2xl px-0 sm:px-2"
                    style={{ maxHeight: '50rem' }}
                  >
                    {images.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <div className="flex flex-col items-center p-1 sm:p-4 justify-center w-full h-full" style={{ minHeight: '18rem' }}>
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="rounded-xl w-full max-w-[95vw] sm:max-w-full max-h-[60vw] sm:max-h-96 object-contain cursor-pointer"
                            style={{ maxHeight: '60vw', minHeight: '180px', maxWidth: '95vw' }}
                            onClick={() => openModal(img.src)}
                          />
                          <div className="mt-2 sm:mt-4 text-center text-base sm:text-lg md:text-xl text-gray-100 bg-sky-950 bg-opacity-90 px-2 sm:px-4 py-2 rounded-xl w-full max-w-[95vw] sm:max-w-lg shadow font-semibold" style={{lineHeight:'1.4'}}>
                            {img.caption}
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      { !user && (
        <motion.section
          className="bg-gradient-to-r from-sky-700 to-purple-700 py-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t("landingpage.callToAction.title")}
          </h2>
          <p className="text-lg mb-6 text-gray-200">
            {t("landingpage.callToAction.subtitle")}
          </p>
          <div>
            <Link 
              to={"/signup"} 
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mr-4">
              {t("landingpage.callToAction.buttons.signUp")}
            </Link>
            <Link 
              to={"/login"} 
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
              {t("landingpage.callToAction.buttons.logIn")}
            </Link>
          </div>
        </motion.section>
      )}
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
    </div>

  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="bg-gray-900 p-6 rounded-lg shadow-lg text-center hover:bg-gray-800 transition"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

// Skeleton Loader for Feature Cards
const FeatureCardSkeleton = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
    <Skeleton circle={true} height={50} width={50} className="mx-auto mb-4" />
    <Skeleton height={20} width="60%" className="mx-auto mb-2" />
    <Skeleton height={15} width="80%" className="mx-auto" />
  </div>
);

// Step Card Component for How It Works
const Step = ({ number, title, description }) => (
  <div className="flex flex-col items-center relative z-10">
    <div className="bg-sky-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4 border-4 border-sky-900">{number}</div>
    <h3 className="text-lg font-semibold mb-2 bg-sky-950 px-3 text-center py-1 rounded-2xl relative z-10">{title}</h3>
    <p className="text-gray-400 text-center">{description}</p>
  </div>
);

export default LandingPage;
