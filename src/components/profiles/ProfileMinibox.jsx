import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useView } from "../../context/ViewContext";
import { IoChatboxOutline } from "react-icons/io5";
import { BsPostcard } from "react-icons/bs";
import { useAuth } from "../../context/AuthContext";
import { useConversations } from "../../context/social/chat/ConversationsContext";
import { useParticipants } from "../../context/social/chat/ParticipantsContext";
import { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { handleStartChat } from "../social/chat/utilis/handleStartChat";

const ProfileMinibox = ({ profile, isLoading }) => {
  const { manageView } = useView();
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const {findConversation, createConversation} = useConversations();
  const { addParticipant } = useParticipants();
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  const navigate = useNavigate();
  const isOwnProfile = loggedIn && (user.id === profile.id);

  const startChat = () => {
    if (isStartingChat) return;
    if (!loggedIn) {
      navigate("/login");
      return;
    }
    handleStartChat({
      myProfileId: user.id,
      otherProfile: profile,
      findConversation,
      createConversation,
      addParticipant,
      navigate,
      setLoading: setIsStartingChat,
    })
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 p-3 rounded-lg shadow-md bg-white dark:bg-zinc-900 w-64"
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
      className="absolute z-50 p-4 rounded-lg shadow-md bg-white dark:bg-zinc-900 w-64 text-sm"
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
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">@{username}</p>
          {(city || country) && (
            <p className="text-zinc-500 text-xs">
              {city}{city && country ? ", " : ""}{country}
            </p>
          )}
        </div>
      </div>
      {bio && (
        <p className="text-zinc-600 dark:text-zinc-300 line-clamp-4">
          {bio.length > 50 ? `${bio.slice(0, 100)}...` : bio}
        </p>
      )}
      {/* message icon */}
      <div className="flex justify-end items-center gap-5 pt-2">

        {isOwnProfile && (
          <Link
          title="Edit Profile"
          onClick={() => manageView("editProfile", "edit")}
          to={`/profile/${id}`}
          className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <AiFillEdit size={30} />
        </Link>
      )}

        <Link
          title="View Posts"
          onClick={() => manageView("displayPosts", "profile")}
          to={`/profile/${id}`}
          className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <BsPostcard size={30} />
        </Link>

        <button
          title="Send Message"
          className="text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          onClick={startChat}
        >
          <IoChatboxOutline size={30} />
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileMinibox;
