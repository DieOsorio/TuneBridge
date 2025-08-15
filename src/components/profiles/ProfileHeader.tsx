import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/context/AuthContext";
import { useConversations } from '@/context/social/chat/ConversationsContext';
import { useParticipants } from '@/context/social/chat/ParticipantsContext';
import { useNotifications } from '@/context/social/NotificationsContext';
import { useMessages } from '@/context/social/chat/MessagesContext';
import { useUserConnections } from '@/context/social/UserConnectionsContext';
import { useSettings } from '@/context/settings/SettingsContext';
import { useBannedUsers } from "@/context/admin/BannedUsersContext";
import { handleStartChat } from '../social/chat/utilis/handleStartChat';

import type { Profile } from "@/context/profile/profileActions"

import ProfileAvatar from './ProfileAvatar';
import Button from '../ui/Button';
import MatchScoreIndicator from './MatchScoreIndicator';
import formatLastSeen from '@/utils/formatLastSeen';
import { useCanSendDM } from '@/utils/useCanSendDM';
import ReportForm from '@/utils/ReportForm';
import Modal from '../ui/Modal';


import {
  XMarkIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserIcon,
  BellIcon,
  Cog6ToothIcon, 
  ChatBubbleLeftRightIcon, 
  ChatBubbleLeftEllipsisIcon 
} from "@heroicons/react/24/solid";
import { ImBlocked } from "react-icons/im";
import { 
  FaUserCheck, 
  FaUserClock, 
  FaUserPlus, 
  FaUserSlash 
} from "react-icons/fa";
import { MdReport } from "react-icons/md";

export interface ProfileHeaderProps {
  isOwnProfile: boolean;
  profileData: Profile;
}

const ProfileHeader = ({ isOwnProfile, profileData }: ProfileHeaderProps) => {
  const { t } = useTranslation("profile");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { privacyOthers } = useSettings();
  const { data: privacyPrefs } = privacyOthers(profileData.id);
  const { totalUnreadMessages } = useMessages();
  const { data: unreadMessagesCount, isLoading: loadingUnreadMessages } = totalUnreadMessages(user?.id ?? "");
  const { findConversation, createConversation } = useConversations();
  const { addParticipant } = useParticipants();
  const { userNotifications, notificationsRealtime } = useNotifications();
  notificationsRealtime(user!.id);
  const { data: notifications, isLoading } = userNotifications(user?.id ?? "");
  const { connectionBetweenProfiles, addConnection, updateConnection, deleteConnection } = useUserConnections();
  const { data: connection, isLoading: loadingConnection } = connectionBetweenProfiles(user?.id ?? "", profileData.id);
  const { canSend, loading: loadingCanSend, reason } = useCanSendDM(profileData.id);
  const { bannedUser } = useBannedUsers();

  const [isStartingChat, setIsStartingChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const lastSeenActive = Boolean(privacyPrefs?.show_last_seen && profileData.last_seen);

  const startChat = () => {
    if (isStartingChat || !user) return;

    if (bannedUser?.type === "messaging") {
      navigate("/banned");
      return;
    }
    
    handleStartChat({
      myProfileId: user.id,
      otherProfile: profileData,
      findConversation,
      createConversation,
      addParticipant,
      navigate,
      setLoading: () => setIsStartingChat(true),
    });
  };

  // Connection action handlers
  const handleConnect = async () => {
    if (!user) return;
    await addConnection({
      follower_profile_id: user.id,
      following_profile_id: profileData.id,
      status: 'pending',
    });
  };
  const handleDisconnect = async () => {
    if (connection) await deleteConnection(connection);
  };
  const handleBlock = async () => {
    if (!user) return;
    if (connection) {
      await updateConnection({
        connection,
        updatedConnection: { status: 'blocked' },
      });
    } else {
      await addConnection({
        follower_profile_id: user.id,
        following_profile_id: profileData.id,
        status: 'blocked',
      });
    }
  };
  const handleUnblock = async () => {
    if (connection) {
      await updateConnection({
        connection,
        updatedConnection: { status: 'accepted' },
      });
    }
  };

  const getConnectionIcon = (status: string | undefined) => {
    const baseClass = "text-white text-lg mr-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]";
    const blockedOtherClass = "text-gray-300 text-lg mr-1 drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]";

    if (status === "accepted") return <FaUserCheck className={baseClass} />;
    if (status === "pending") return <FaUserClock className={baseClass} />;
    if (status === "blocked" && connection?.follower_profile_id === user?.id) return <FaUserSlash className={baseClass} />;
    if (status === "blocked" && connection?.follower_profile_id === profileData.id) return <FaUserSlash className={blockedOtherClass} />;
    return <FaUserPlus className={baseClass} />;
  };

  // Connection status logic
  const isConnected = connection?.status === 'accepted';
  const isPending = connection?.status === 'pending';
  const isBlocked = connection?.status === 'blocked' && connection?.follower_profile_id === user?.id;
  const isOtherBlocked = connection?.status === 'blocked' && connection?.follower_profile_id === profileData.id;

  return (
    <div className="bg-gradient-to-l md:min-w-2xl lg:min-w-4xl from-gray-900 to-gray-950 mb-4 p-4 rounded-b-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Profile Avatar and Info */}
        <div className="flex items-center gap-4 flex-grow">
          <Link to={`/profile/${profileData.id}`}>
            <ProfileAvatar
              avatar_url={profileData.avatar_url}
              className="flex-shrink-0 !w-24 !h-24"
              gender={profileData.gender}
            />
          </Link>
          <div className="flex flex-col gap-2 flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 break-words">
              {profileData.username}
            </h1>
            <p className="text-gray-400 break-words">{profileData.bio}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 ml-auto sm:mb-auto items-center relative">
          {!isOwnProfile && (
            <>
              {canSend && (
                <ChatBubbleLeftRightIcon
                  className="w-8 h-8 text-white cursor-pointer"
                  onClick={startChat}
                  title={t("profile.titles.startChat")}
                />
              )}
              {/* Menu toggle button */}
              <div className="relative">
                <button
                  className="w-6 h-6 cursor-pointer text-white hover:text-sky-400 p-2 rounded-full focus:outline-none"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Connection options"
                >
                  <span className={`absolute inset-0 flex items-center justify-center transition ${menuOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
                    <EllipsisVerticalIcon />
                  </span>
                  <span className={`absolute inset-0 flex items-center justify-center transition ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    <XMarkIcon />
                  </span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 z-20 bg-gray-900 border border-sky-700 rounded shadow-lg py-1 w-44 flex flex-col min-w-[150px] profile-connection-menu">
                    {loadingConnection ? (
                      <span 
                        className="px-4 py-2 text-gray-400 text-xs flex items-center gap-2">
                          {t("connection.loading")}
                      </span>
                    ) : isBlocked ? (
                      <button 
                        onClick={() => { handleUnblock(); setMenuOpen((open) => !open); }}              
                        className="px-4 py-2 justify-between cursor-pointer text-left hover:bg-gray-800 text-sm text-yellow-600 flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4" />{t("connection.unblock")}
                      </button>
                    ) : isOtherBlocked ? (
                      <span 
                        className="px-4 py-2 cursor-pointer justify-between text-red-400 text-xs flex items-center gap-2">
                          <ImBlocked />{t("connection.blockedByOther")}
                      </span>
                    ) : isConnected ? (
                      <button 
                        onClick={() => { handleDisconnect(); setMenuOpen((open) => !open); }}
                        className="px-4 py-2 justify-between cursor-pointer text-left hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4" />{t("connection.disconnect")}
                      </button>
                    ) : isPending ? (
                      <button
                        onClick={() => { handleDisconnect(); setMenuOpen((open) => !open); }}
                        className="px-4 py-2 cursor-pointer justify-between text-left hover:bg-gray-800 text-sm text-yellow-400 flex items-center gap-2 group"
                        onMouseEnter={() => setHoverText('disconnect')}
                        onMouseLeave={() => setHoverText(null)}
                      >
                        {hoverText === 'disconnect' ? <UserMinusIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                        {hoverText === 'disconnect'
                          ? t("connection.disconnect")
                          : t("connection.pending")}
                      </button>
                    ) : (
                      <button 
                        onClick={() => { handleConnect(); setMenuOpen((open) => !open); }} 
                        className="px-4 py-2 cursor-pointer justify-between text-left hover:bg-gray-800 text-sm text-green-600 flex items-center gap-2">
                          <UserPlusIcon className="w-4 h-4" />{t("connection.connect")}
                      </button>
                    )}
                    {/* Block option always available unless blocked by other or already blocked */}
                    {!isOtherBlocked && !isBlocked && (
                      <button 
                        onClick={() => { handleBlock(); setMenuOpen((open) => !open); }} 
                        className="px-4 py-2 justify-between cursor-pointer text-left hover:bg-gray-800 text-sm text-red-400 border-t border-sky-800 flex items-center gap-2">
                          <ImBlocked />{t("connection.block")}
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setShowReportForm(true);
                        setMenuOpen(false);
                      }}
                      className="px-4 py-2 text-left justify-between cursor-pointer hover:bg-gray-800 text-sm text-red-500 border-t border-sky-800 flex items-center gap-2"
                    >
                      <MdReport size={18} />{t("reportUser.title")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {isOwnProfile && (
            <>
              <div className="relative">
                <ChatBubbleLeftEllipsisIcon
                  className="w-8 h-8 text-white cursor-pointer"
                  onClick={() => navigate("/chat")}
                  title={t("profile.titles.chat")}
                />
                {!loadingUnreadMessages && (unreadMessagesCount?.total ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {unreadMessagesCount?.total}
                  </span>
                )}
              </div>
              <Cog6ToothIcon
                className="w-8 h-8 text-white cursor-pointer"
                onClick={() => {
                  navigate("/settings");
                }}
                title={t("profile.titles.settings")}
              />
              <div className="relative">
                <BellIcon
                  className="w-7 h-7 text-white cursor-pointer"
                  onClick={() => navigate(`/profile/${profileData.id}/notifications`)}
                  title={t("profile.titles.notifications")}
                />
                {!isLoading && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {unreadCount}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-end mt-6">
        {!isOwnProfile && (
          <div className="w-full mx-auto md:mx-0 md:!mr-auto mb-3 flex flex-col items-start gap-6 mt-3">
            <div className="flex flex-col items-stretch w-full md:flex-row gap-3 md:gap-6">
              {/* Styled Connection Status Badge */}
              {!loadingConnection && (
                <button
                  title={
                    connection
                      ? connection.status === "accepted"
                        ? t("connection.disconnect")
                        : connection.status === "pending"
                        ? t("connection.cancelRequest")
                        : connection.status === "blocked"
                          ? connection.follower_profile_id === user?.id
                            ? t("connection.unblock")
                            : t("connection.blockedByOther")
                          : "" // fallback
                      : t("connection.connect")
                  }
                  onClick={() => {
                    if (!connection) return handleConnect();
                    if (connection.status === "pending") return handleDisconnect();
                    if (connection.status === "accepted") return handleDisconnect();
                    if (connection.status === "blocked" && connection.follower_profile_id === user?.id) return handleUnblock();
                  }}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition
                    ${
                      connection
                        ? connection.status === "accepted"
                          ? "bg-emerald-700 text-white hover:bg-emerald-800"
                          : connection.status === "pending"
                          ? "bg-yellow-600 text-white hover:bg-yellow-700"
                          : connection.status === "blocked" && connection.follower_profile_id === user?.id
                          ? "bg-red-700 text-white hover:bg-red-800"
                          : connection.status === "blocked" && connection.follower_profile_id === profileData.id
                          ? "bg-gray-600 text-gray-200 cursor-not-allowed"
                          : "bg-gray-700 text-white"
                        : "bg-sky-700 text-white hover:bg-sky-800"
                    }
                    ${
                      connection?.status === "blocked" && connection.follower_profile_id === profileData.id
                        ? "pointer-events-none"
                        : "cursor-pointer"
                    }
                  `}
                  disabled={connection?.status === "blocked" && connection.follower_profile_id === profileData.id}
                >
                  {getConnectionIcon(connection?.status)}
                  {connection
                    ? connection.status === "accepted"
                      ? t("connection.accepted")
                      : connection.status === "pending"
                      ? t("connection.pending")
                      : connection.status === "blocked" && connection.follower_profile_id === user?.id
                      ? t("connection.blocked")
                      : connection.status === "blocked" && connection.follower_profile_id === profileData.id
                      ? t("connection.blockedByOther")
                      : ""
                    : t("connection.connect")}
                </button>
              )}
              {/* Match Score Indicator */}
              <div>
                <MatchScoreIndicator otherProfile={profileData} />
              </div>
            </div>
            {/* Last‑seen badge */}
            {lastSeenActive && (
              <p className="text-xs mx-auto sm:mx-0 sm:mr-auto text-gray-400">
                {t("profile.lastSeen", { time: formatLastSeen(profileData.last_seen) })}
              </p>
            )}
          </div>
        )}
        <div>
          <div className="mb-4">
            <Button onClick={() => navigate(`/profile/${profileData.id}`)}>
              {t("profile.navigation.about")}
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button onClick={() => navigate(`/profile/${profileData.id}/ads`)}>
              {t("profile.navigation.ads")}
            </Button>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <Button onClick={() => navigate(`/profile/${profileData.id}/posts`)}>
              {t("profile.navigation.posts")}
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button
              starBorder
              onClick={() => navigate(`/profile/${profileData.id}/groups`)}
              className='!bg-amber-800 hover:!bg-amber-900'
            >
              {t("profile.navigation.groups")}
            </Button>
          </div>
        </div>
      </div>
      {showReportForm && (
        <Modal onClose={() => setShowReportForm(false)}>
          <ReportForm
            targetType="user"
            targetId={profileData.id}
            targetOwnerId={profileData.id}
            title={t("reportUser.title")}
            description={t("reportUser.description")}
            onClose={() => setShowReportForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProfileHeader;
