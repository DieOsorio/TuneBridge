import React, { useState } from "react";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Banner from "../components/ui/Banner";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { AiOutlineClose } from "react-icons/ai";
import FeatureCard from "../components/landing-page/FeatureCard";

interface ScreenshotData {
  key: string;
  title: string;
  description: string;
  images: { src: string; alt: string; caption: string }[];
}

const LandingPage: React.FC = () => {
  const { t } = useTranslation("ui");
  const { user } = useAuth();
  const isLoading = false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const howItWorks: { title: string; description: string }[] = t(
  "landingpage.howItWorks.steps",
  { returnObjects: true }
) as { title: string; description: string }[];

  const features: { title: string; description: string; svgSrc: string }[] = t(
  "landingpage.features.cards",
  { returnObjects: true }
) as { title: string; description: string; svgSrc: string }[];

  const audience: { title: string; description: string; gifSrc: string }[] = t(
  "landingpage.audience.cards",
  { returnObjects: true }
) as { title: string; description: string; gifSrc: string }[];

  const audienceTitle: string = t("landingpage.audience.sectionTitle");

  const screenshotSections = ["profile", "media", "ads", "groups", "events", "chat"];
  const screenshotsData: ScreenshotData[] = screenshotSections.map((section) => {
    const images = t(`landingpage.screenshots.${section}.images`, {
      returnObjects: true,
    });
    return {
      key: section,
      title: t(`landingpage.screenshots.${section}.title`),
      description: t(`landingpage.screenshots.${section}.description`),
      images: Array.isArray(images) ? images : [],
    };
  });
  const screenshotsSectionTitle: string = t("landingpage.screenshots.sectionTitle");
  const screenshotsSectionDescription: string = t("landingpage.screenshots.description");

  const openModal = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsModalOpen(true);
  };

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
          backgroundImage="/heroImage.webp"
          button={t("landingpage.callToAction.buttons.joinUs")}
          user={user}
        />
      </motion.div>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-16 bg-gradient-to-r from-gray-900 to-sky-950">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-amber"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {t("landingpage.features.sectionTitle")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <FeatureCardSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              {features.map((feature, i) => (
                <FeatureCard
                  key={i}
                  index={i}
                  title={feature.title}
                  description={feature.description}
                  svgSrc={feature.svgSrc}
                />
              ))}
            </>
          )}
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-16 px-6 md:px-16 bg-gradient-to-r from-sky-950 to-gray-900">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          {audienceTitle}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {audience.map((card, idx) => (
            <motion.div
              key={idx}
              className="bg-gray-900 rounded-xl border border-sky-600 p-6 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div className="flex justify-between">
                <h3 className="text-xl font-semibold text-sky-500 mb-2">{card.title}</h3>
                <div className="w-45 h-45 mb-4">
                  <img
                    src={card.gifSrc}
                    alt={card.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-gray-300 text-center">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

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
            <button
              className="absolute top-1 right-1 text-white hover:text-red-100 cursor-pointer z-10"
              onClick={closeModal}
            >
              <AiOutlineClose size={28} />
            </button>

            <img
              src={currentImage || ""}
              alt="Full-size post image"
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-md shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
    <Skeleton circle={true} height={50} width={50} className="mx-auto mb-4" />
    <Skeleton height={20} width="60%" className="mx-auto mb-2" />
    <Skeleton height={15} width="80%" className="mx-auto" />
  </div>
);

interface StepProps {
  number: number;
  title: string;
  description: string;
  isFinal?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, isFinal = false }) => {
  const bgColor = isFinal ? "bg-amber-700 border-amber-900" : "bg-sky-600 border-sky-900";
  const titleBg = isFinal ? "bg-amber-900" : "bg-sky-950";

  return (
    <div className="flex flex-col items-center relative z-10">
      <div
        className={`text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold mb-4 border-4 ${bgColor}`}
      >
        {number}
      </div>
      <h3
        className={`text-lg font-semibold mb-2 ${titleBg} px-3 text-center py-1 rounded-2xl relative z-10`}
      >
        {title}
      </h3>
      <p className="text-gray-400 text-center">{description}</p>
    </div>
  );
};

export default LandingPage;
