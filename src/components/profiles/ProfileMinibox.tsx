import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useConversations } from "@/context/social/chat/ConversationsContext";
import { useParticipants } from "@/context/social/chat/ParticipantsContext";

import { motion } from "framer-motion";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon  } from "@heroicons/react/24/solid";
import { BsPostcard } from "react-icons/bs";

import { handleStartChat } from "../social/chat/utilis/handleStartChat";
import { useCanSendDM } from "@/utils/useCanSendDM";

import type { Profile } from "@/context/profile/profileActions";
import type { ProfileGroup } from "@/context/profile/profileGroupsActions";

import ProfileMiniboxSkeleton from "./skeletons/ProfileMiniboxSkeleton";
import { MdReport } from "react-icons/md";
import Modal from "../ui/Modal";
import ReportForm from "@/utils/ReportForm";
import { useTranslation } from "react-i18next";

export interface ProfileMiniboxProps {
  profile: Profile | ProfileGroup;
  isLoading?: boolean;
  isGroup?: boolean;
}

// Type guard to detect if profile is a user Profile (has 'username')
function isUserProfile(p: Profile | ProfileGroup): p is Profile {
  return (p as Profile).username !== undefined;
}

const ProfileMinibox: React.FC<ProfileMiniboxProps> = ({ profile, isLoading, isGroup }) => {
  const { t } = useTranslation("profile", { keyPrefix: "reportUser" });
  const { user } = useAuth();
  const loggedIn = Boolean(user);
  const { findConversation, createConversation } = useConversations();
  const { addParticipant } = useParticipants();
  const { canSend, loading: LoadingSendDM } = useCanSendDM(profile.id);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);

  const loading = isLoading || LoadingSendDM;
  const navigate = useNavigate();
  const isOwnProfile = loggedIn && user?.id === profile.id;

  const simplifiedAddParticipant = async ({
    conversation_id,
    profile_id,
  }: {
    conversation_id: string;
    profile_id: string;
  }) => {
    return addParticipant({
      conversation_id,
      profile_id,
      role: "member",
    });
  };

  const startChat = () => {
    if (isStartingChat) return;
    if (!loggedIn || !user) {
      navigate("/login");
      return;
    }
    if (!isGroup && "username" in profile) {
      handleStartChat({
        myProfileId: user.id,
        otherProfile: profile,
        findConversation,
        createConversation,
        addParticipant: simplifiedAddParticipant,
        navigate,
        setLoading: () => setIsStartingChat(true),
      });
    } 
  };

  if (loading) {
    return <ProfileMiniboxSkeleton />;
  }

  if (!profile) return null;

  const { state, country, bio, avatar_url, id } = profile;
  const username = isUserProfile(profile) ? profile.username : null;
  const name = !isUserProfile(profile) ? profile.name : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="absolute z-50 p-4 rounded-lg shadow-md bg-neutral-100 dark:bg-neutral-900 w-64 text-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <Link to={isGroup ? `/group/${id}` : `/profile/${id}`}>
            <img
              src={avatar_url ?? undefined}
              alt={`Avatar of ${username || name}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          </Link>
          <div className="ml-6">
            <p className="font-semibold text-center text-neutral-900 dark:text-neutral-100 mb-2">
              @{username || name}
            </p>
            {(state || country) && (
              <p className="text-neutral-400 text-xs">
                {state}
                {state && country ? ", " : ""}
                {country}
              </p>
            )}
          </div>
        </div>
        {bio && (
          <p className="text-neutral-600 dark:text-neutral-300 line-clamp-4">
            {bio.length > 50 ? `${bio.slice(0, 100)}...` : bio}
          </p>
        )}
        <div className="flex justify-end items-center gap-5 pt-2">
          {/* Report */}
          {loggedIn && !isOwnProfile && (
            <div className="mt-1.5 mr-auto">
              <MdReport
                onClick={() => {
                  setShowReportForm(true);
                }} 
                title={t("title")}
                className="text-red-700/70 hover:text-red-600 cursor-pointer mx-auto"
                size={21}
              />
            </div>
          )}
          {isOwnProfile && (
            <Link
              title="Edit Profile"
              to="/settings/profile"
              className="text-neutral-400 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition"
            >
              <PencilSquareIcon className="w-7 h-7" />
            </Link>
          )}          
          <Link
            title="View Posts"
            to={isGroup ? `/group/${id}/posts` : `/profile/${id}/posts`}
            className="text-neutral-400 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition"
          >
            <BsPostcard size={28} />
          </Link>
          {canSend && !isGroup && (
            <button
              title="Send Message"
              className="text-neutral-400 cursor-pointer hover:text-neutral-900 dark:hover:text-neutral-100 transition"
              onClick={startChat}
            >
              <ChatBubbleLeftIcon className="w-7 h-7" />
            </button>
          )}
        </div>
      </motion.div>
      {showReportForm && (
        <Modal onClose={() => setShowReportForm(false)}>
          <ReportForm
            targetType="user"
            targetId={profile.id}
            targetOwnerId={profile.id}
            title={t("title")}
            description={t("description")}
            onClose={() => setShowReportForm(false)}
          />
        </Modal>
      )}
    </>
  );
};

export default ProfileMinibox;
