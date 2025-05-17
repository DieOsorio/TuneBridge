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
import { useState } from 'react';
import { useNotifications } from '../../context/social/NotificationsContext';

function ProfileHeader({ isOwnProfile, profileData }) {
    const { manageView } = useView();
    const { user } = useAuth();
    const navigate = useNavigate();
    const {findConversation, createConversation} = useConversations();
    const { addParticipant } = useParticipants();
    const { userNotifications, notificationsRealtime } = useNotifications();
    notificationsRealtime(user.id);
    const { data: notifications, isLoading } = userNotifications(user.id);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
    
    const handleStartChat = async () => {
        if (isStartingChat) return;

        try {       
            const conversationData  = await findConversation({ myProfileId: user.id, otherProfileId: profileData.id });

          if (conversationData) {
            navigate(`/chat/${conversationData.id}`);
          } else {
              
            const newConv = await createConversation({
                created_by: user.id,
                avatar_url: profileData.avatar_url,
                title: profileData.username
            });        
    
            // Add participants to the new conversation
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

  return (
    <div className="bg-gradient-to-l from-gray-900 to-gray-950 mb-4 p-4 rounded-b-lg">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Profile Avatar and Info */}
        <div className="flex items-center gap-4 flex-grow">
          <ProfileAvatar
            onClick={() => manageView("about", "profile")}
            avatar_url={profileData.avatar_url}
            className="flex-shrink-0" // Ensure the avatar is round and does not shrink
          />
          <div className="flex flex-col gap-2 flex-grow">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 break-words">
              {profileData.username}
            </h1>
            <p className="text-gray-400 break-words">{profileData.bio}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mx-auto sm:ml-auto sm:mb-auto">
          {!isOwnProfile && (
            <IoChatboxSharp
              className="w-8 h-8 text-white cursor-pointer"
              onClick={handleStartChat}
              disabled={isStartingChat}
            />
          )}
          {isOwnProfile && (
            <>
              <IoChatbubblesSharp
                className="w-8 h-8 text-white cursor-pointer"
                onClick={() => navigate("/chat")}
              />
              <IoIosSettings
                className="w-8 h-8 text-white cursor-pointer"
                onClick={() => manageView("editProfile", "edit")}
              />
              <div className="relative">
                <BsFillBellFill
                  className="w-7 h-7 text-white cursor-pointer"
                  onClick={() => manageView("allNotifications", "notifications")}
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
            <Button onClick={() => manageView("about", "profile")}>About</Button>
          </div>
          <div className="sm:mb-4">
            <Button onClick={() => manageView("music", "profile")}>Music</Button>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Button onClick={() => manageView("displayPosts", "profile")}>
              Posts
            </Button>
          </div>
          <div className="sm:mb-4">
            <Button onClick={() => manageView("groups", "profile")}>Groups</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader