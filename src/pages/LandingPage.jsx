import { FaMusic, FaHandshake, FaMicrophoneAlt } from "react-icons/fa"; // Importing icons
import { motion } from "framer-motion"; // For animations
import Skeleton from "react-loading-skeleton"; // For skeleton loaders
import "react-loading-skeleton/dist/skeleton.css"; // Skeleton styles
import Banner from "../components/ui/Banner";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const { user } = useAuth();
  const isLoading = false; // Simulate loading state for skeletons

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Banner
          title="Connect with other musicians"
          subtitle="A place where your music and connections grow."
          backgroundImage="/rhythmic-hands-drumming-stockcake.jpg"
        />
      </motion.div>

      {/* Features Section */}
      <section className="py-12 px-6 md:px-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          What can you do on Music Connects?
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
              <FeatureCard
                icon={<FaMusic className="text-sky-500 mx-auto" />}
                title="Share Your Music"
                description="Upload your tracks, share your ideas, and get feedback from other musicians."
              />
              <FeatureCard
                icon={<FaHandshake className="text-green-400 mx-auto" />}
                title="Connect with Others"
                description="Find musicians, producers, and collaborators for your projects."
              />
              <FeatureCard
                icon={<FaMicrophoneAlt className="text-purple-400 mx-auto" />}
                title="Collaborate in Real-Time"
                description="Chat, share files, and work together in real-time."
              />
            </>
          )}
        </div>
      </section>

      {/* Trending Tracks Section */}
      <section className="py-12 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          Trending Tracks
        </h2>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-6 justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-full md:w-1/3">
            <img
              src="/for-landing-page/musician-1.jpg"
              alt="Track 1"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-white">Track 1</h3>
            <p className="text-gray-400">Artist Name</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-full md:w-1/3">
            <img
              src="/for-landing-page/musician-2.jpg"
              alt="Track 2"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-white">Track 2</h3>
            <p className="text-gray-400">Artist Name</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center w-full md:w-1/3">
            <img
              src="/for-landing-page/musician-3.jpg"
              alt="Track 3"
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold text-white">Track 3</h3>
            <p className="text-gray-400">Artist Name</p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <motion.section
        className="bg-gradient-to-r from-sky-700 to-purple-700 py-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Join the Community!
        </h2>
        <p className="text-lg mb-6 text-gray-200">
          Sign up now and take your music to the next level.
        </p>
        <div>
          <Link 
            to={"/signup"} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mr-4">
            Sign Up
          </Link>
          <Link 
            to={"/login"} 
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
            Log In
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-lg shadow-lg text-center hover:bg-gray-700 transition"
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

export default LandingPage;
