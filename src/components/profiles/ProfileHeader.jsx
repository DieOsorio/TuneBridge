import ProfileAvatar from './ProfileAvatar';
import { useView } from '../../context/ViewContext'
import { useAuth } from "../../context/AuthContext";
import Button from '../ui/Button';
import { BsFillBellFill } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { IoChatboxSharp } from "react-icons/io5";
import { IoChatbubblesSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useConversations } from '../../context/social/chat/ConversationsContext';
import { useParticipants } from '../../context/social/chat/ParticipantsContext';
import { useState, useEffect } from 'react';
import { useNotifications } from '../../context/social/NotificationsContext';
import { useMessages } from '../../context/social/chat/MessagesContext';
import { useTranslation } from 'react-i18next';
import { useUserConnections } from '../../context/social/UserConnectionsContext';
import { FiMoreVertical } from "react-icons/fi";
import { IoPersonAdd, IoPersonRemove, IoPersonOutline, IoPerson } from "react-icons/io5";
import { ImBlocked } from "react-icons/im"
import StarBorder from '../ui/StarBorder';

function ProfileHeader({ isOwnProfile, profileData }) {
    const { t } = useTranslation("profile");
    const { manageView } = useView();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { totalUnreadMessages } = useMessages();
    const { data: unreadMessagesCount, isLoading: loadingUnreadMessages } = totalUnreadMessages(user?.id);
    const {findConversation, createConversation} = useConversations();
    const { addParticipant } = useParticipants();
    const { userNotifications, notificationsRealtime } = useNotifications();
    notificationsRealtime(user.id); // Set up real-time notifications for the user
    const { data: notifications, isLoading } = userNotifications(user.id);
    const { connectionBetweenProfiles, addConnection, updateConnection, deleteConnection } = useUserConnections();
    const { data: connection, isLoading: loadingConnection } = connectionBetweenProfiles(user?.id, profileData.id);

    const [isStartingChat, setIsStartingChat] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [hoverText, setHoverText] = useState(null);
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

    const handleStartChat = async () => {
        if (isStartingChat) return;
        setIsStartingChat(true);
        try {
            // Always fetch all conversations between these two users
            const allConversations = await findConversation({ myProfileId: user.id, otherProfileId: profileData.id, all: true });
            let oneOnOne = null;
            let group = null;
            if (Array.isArray(allConversations)) {
                oneOnOne = allConversations.find(c => !c.is_group);
                group = allConversations.find(c => c.is_group);
            } else if (allConversations && typeof allConversations === 'object') {
                if (allConversations.is_group) group = allConversations;
                else oneOnOne = allConversations;
            }

            if (oneOnOne) {
                // Always prefer the one-on-one if it exists
                navigate(`/chat/${oneOnOne.id}`);
            } else if (group) {
                // If only a group exists, navigate to the group (or show a message)
                navigate(`/chat/${group.id}`);
                // Optionally, show a toast: "You already have a group chat with this user."
            } else {
                // No conversation exists, create a new one-on-one
                const newConv = await createConversation({
                    created_by: user.id,
                    avatar_url: profileData.avatar_url,
                    title: profileData.username
                });
                const loggedUser = { conversation_id: newConv.id, profile_id: user.id };
                const otherUser = { conversation_id: newConv.id, profile_id: profileData.id };
                await addParticipant(loggedUser);
                await addParticipant(otherUser);
                navigate(`/chat/${newConv.id}`);
            }
        } catch (err) {
            console.error("Error iniciando conversación:", err);
        } finally {
            setIsStartingChat(false);
        }
    };

    // Connection action handlers
    const handleConnect = async () => {
      await addConnection({ 
        follower_profile_id: user.id, 
        following_profile_id: profileData.id, 
        status: 'pending' 
      });
    };
    const handleDisconnect = async () => {
      if (connection) await deleteConnection(connection);
    };
    const handleBlock = async () => {
      if (connection) {
        await updateConnection({ 
          connection,
          updatedConnection: { status: 'blocked' }
        });
      } else {
        await addConnection({ 
          follower_profile_id: user.id, 
          following_profile_id: profileData.id, 
          status: 'blocked' 
        });
      }
    };
    const handleUnblock = async () => {
      if (connection) {
        await updateConnection({
          connection,
          updatedConnection: { status: 'accepted' }
        });
      }
    };

    // Close menu on outside click
    useEffect(() => {
      if (!menuOpen) return;
      const handleClick = (e) => {
        if (!e.target.closest('.profile-connection-menu')) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [menuOpen]);

    // Connection status logic
    const isConnected = connection?.status === 'accepted';
    const isPending = connection?.status === 'pending';
    const isBlocked = connection?.status === 'blocked' && connection.follower_profile_id === user.id;
    const isOtherBlocked = connection?.status === 'blocked' && connection.follower_profile_id === profileData.id;

  return (
    <div className="bg-gradient-to-l from-gray-900 to-gray-950 mb-4 p-4 rounded-b-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Profile Avatar and Info */}
        <div className="flex items-center gap-4 flex-grow">
          <ProfileAvatar
            onClick={() => manageView("about", "profile")}
            avatar_url={profileData.avatar_url}
            className="flex-shrink-0"
            gender={profileData.gender}
          />
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
              <IoChatboxSharp
                className="w-8 h-8 text-white cursor-pointer"
                onClick={handleStartChat}
                disabled={isStartingChat}
                title={t("profile.titles.startChat")}
              />
              {/* Three dots menu for connection actions */}
              <div className="relative">
                <button
                  className="text-white hover:text-sky-400 p-2 rounded-full focus:outline-none"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Connection options"
                >
                  <FiMoreVertical size={24} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 z-20 bg-gray-900 border border-sky-700 rounded shadow-lg py-1 w-44 flex flex-col min-w-[150px] profile-connection-menu">
                    {loadingConnection ? (
                      <span 
                        className="px-4 py-2 text-gray-400 text-xs flex items-center gap-2">
                          {t("profile.connection.loading")}
                      </span>
                    ) : isBlocked ? (
                      <button 
                        onClick={() => { handleUnblock(); setMenuOpen((open) => !open); }}              
                        className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-yellow-600 flex items-center gap-2">
                          <IoPersonRemove />{t("profile.connection.unblock")}
                      </button>
                    ) : isOtherBlocked ? (
                      <span 
                        className="px-4 py-2 text-red-400 text-xs flex items-center gap-2">
                          <ImBlocked />{t("profile.connection.blockedByOther")}
                      </span>
                    ) : isConnected ? (
                      <button 
                        onClick={() => { handleDisconnect(); setMenuOpen((open) => !open); }}
                        className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2">
                          <IoPersonRemove />{t("profile.connection.disconnect")}
                      </button>
                    ) : isPending ? (
                      <button
                        onClick={() => { handleDisconnect(); setMenuOpen((open) => !open); }}
                        className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-yellow-400 flex items-center gap-2 group"
                        onMouseEnter={() => setHoverText('disconnect')}
                        onMouseLeave={() => setHoverText(null)}
                      >
                        {hoverText === 'disconnect' ? <IoPersonRemove /> : <IoPersonOutline />}
                        {hoverText === 'disconnect'
                          ? t("profile.connection.disconnect")
                          : t("profile.connection.pending")}
                      </button>
                    ) : (
                      <button 
                        onClick={() => { handleConnect(); setMenuOpen((open) => !open); }} 
                        className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-green-600 flex items-center gap-2">
                          <IoPersonAdd />{t("profile.connection.connect")}
                      </button>
                    )}
                    {/* Block option always available unless blocked by other or already blocked */}
                    {!isOtherBlocked && !isBlocked && (
                      <button 
                        onClick={() => { handleBlock(); setMenuOpen((open) => !open); }} 
                        className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-red-400 border-t border-sky-800 flex items-center gap-2">
                          <ImBlocked />{t("profile.connection.block")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          {isOwnProfile && (
            <>
              <div className="relative">
                <IoChatbubblesSharp
                  className="w-8 h-8 text-white cursor-pointer"
                  onClick={() => navigate("/chat")}
                  title={t("profile.titles.chat")}
                />
                {!loadingUnreadMessages && unreadMessagesCount?.total > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {unreadMessagesCount.total}
                  </span>
                )}
              </div>
              <IoIosSettings
                className="w-8 h-8 text-white cursor-pointer"
                onClick={() => manageView("editProfile", "edit")}
                title={t("profile.titles.settings")}
              />
              <div className="relative">
                <BsFillBellFill
                  className="w-7 h-7 text-white cursor-pointer"
                  onClick={() => manageView("allNotifications", "notifications")}
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
        <div>
          <div className="mb-4">
            <Button onClick={() => manageView("about", "profile")}>
              {t("profile.navigation.about")}
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button onClick={() => manageView("music", "profile")}>
              {t("profile.navigation.music")}
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Button onClick={() => manageView("displayPosts", "profile")}>
              {t("profile.navigation.posts")}
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button
              starBorder
              onClick={() => manageView("groups", "profile")}
              className='!bg-amber-800 hover:!bg-amber-900'
            >
              {t("profile.navigation.groups")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader;