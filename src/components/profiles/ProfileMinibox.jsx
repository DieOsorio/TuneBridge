import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import { useView } from "../../context/ViewContext";
import { IoChatboxOutline } from "react-icons/io5";

const ProfileMinibox = ({ profile, isLoading }) => {
  const { manageView } = useView();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 p-3 rounded-lg shadow-md bg-white dark:bg-zinc-800 w-64"
      >
        <Skeleton count={4} />
      </motion.div>
    );
  }

  if (!profile) return null;

  const { username, city, country, bio, avatar_url, id } = profile;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 p-4 rounded-lg shadow-md bg-white dark:bg-zinc-800 w-64 text-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <Link 
          onClick={() => manageView("about", "profile")} 
          to={`/profile/${id}`}>
          <img
            src={avatar_url}
            alt={`Avatar of ${username}`}
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">@{username}</p>
          {(city || country) && (
            <p className="text-zinc-500 text-xs">
              {city}{city && country ? ", " : ""}{country}
            </p>
          )}
        </div>
      </div>
      {bio && (
        <p className="text-zinc-600 dark:text-zinc-300 line-clamp-4">{bio}</p>
      )}
      {/* message icon */}
      <div className="flex justify-end">
        <button
          title="Send Message"
          className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          onClick={() => console.log("Abrir chatbox")} // más adelante lo reemplazás
        >
          <IoChatboxOutline size={30} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileMinibox;
