// Context and utility imports
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { useNavigate } from "react-router-dom";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useAuth } from "../../../context/AuthContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";
import { useForm } from "react-hook-form";
import { HiUserGroup, HiOutlineUserRemove } from "react-icons/hi";
import { HiInformationCircle, HiEllipsisVertical } from "react-icons/hi2";
import { useEffect, useRef, useState } from "react";
import { uploadFileToBucket } from "../../../utils/avatarUtils";
import { HiBars3 } from 'react-icons/hi2';
import { useChatUI } from "../../../context/social/chat/ChatUIContext";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../ui/ConfirmDialog";
import GroupOverview from "./GroupOverview";


const ChatHeader = ({ conversationId }) => {
  // Auth info to identify current user
  const { user } = useAuth();

  const { t } = useTranslation("chat");
  // Fetch conversation data and update logic
  const { fetchConversation, fetchConversations, updateConversation, deleteConversation } = useConversations();
  const { data: conversation, isLoading, error } = fetchConversation(conversationId);
  const { refetch: refetchConversations } = fetchConversations(user.id);

  // Fetch participants of the conversation
  const { fetchParticipants, addParticipant, removeParticipant } = useParticipants();
  const { data: participants = [], isLoading: isParticipantsLoading } = fetchParticipants(conversationId);

  // Fetch current user profile and search logic
  const { fetchProfile, searchProfiles } = useProfile();

  // UI state: search input visibility, edit mode, and title buffer
  const [searchVisible, setSearchVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation?.title || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [isGroupOverviewOpen, setIsGroupOverviewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isConversationListVisible, toggleConversationList } = useChatUI();

  // Get the other participant's profile in direct chats
  let safeParticipants = [];
  if (Array.isArray(participants)) {
    safeParticipants = participants;
  } else if (participants && Array.isArray(participants.pages)) {
    safeParticipants = participants.pages.flat();
  }
  if (!Array.isArray(safeParticipants)) {
    console.error("participants is not an array", participants);
    safeParticipants = [];
  }
  const otherParticipant = safeParticipants.find((p) => p.profile_id !== user.id);
  const { data: otherProfile } = fetchProfile(otherParticipant?.profile_id);

  // Form handling for search input
  const { register, watch } = useForm();
  const searchTerm = watch("searchTerm");

  // Search results and filtering logic
  const { data: searchResults, isLoading: isSearching } = searchProfiles(searchTerm);
  const participantsIds = safeParticipants.map((p) => p.profile_id) || [];
  const filteredResults = searchResults?.filter(
    (profile) => !participantsIds.includes(profile.id)
  ) || [];

  const isGroup = conversation?.is_group;
  const isAdmin = safeParticipants.some(
    (p) => p.profile_id === user.id && p.role === "admin"
  );
  const avatarTriggerRef = useRef();
  const navigate = useNavigate();

  const handleLeaveConversation = async () => {
  try {
    setIsLeaveConfirmOpen(false);
    if (!conversation || !user?.id) return;

    if (isGroup) {
      await removeParticipant({conversation_id: conversation.id, profile_id: user.id});
    } else {
      await deleteConversation(conversation);
    }
    navigate("/chat");
    refetchConversations();
  } catch (error) {
    console.error("Failed to leave conversation:", error.message);
  }
};

  const handleGroupAvatarUpload = async (files) => {
    if (!files?.[0] || !conversationId) return;
    if (isUploading) {
      console.log("Upload already in progress, ignoring new upload.");
      return;
    }

    setIsUploading(true);

    try {
      const newUrl = uploadFileToBucket(
        files[0],
        "chat-group-avatars",
        conversationId,
        conversation?.avatar_url,
        true // <-- enable deletion of previous images
      );

      if (newUrl && newUrl !== conversation?.avatar_url) {
        await updateConversation({
          conversation,
          updates: { avatar_url: newUrl },
        });
      }
    } catch (err) {
      console.error("Error uploading avatar:", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Sync edited title when conversation is loaded or updated
  useEffect(() => {
    if (isGroup) {
      setSearchVisible(true); // Default show search in group chats
      if (conversation?.title) {
        setEditedTitle(conversation.title);
      }
    }
  }, [isGroup, conversation?.title]);

  // Show fallback UI when no conversation is selected
  if (!conversationId) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 border-b border-sky-600">
        <h2 className="text-lg font-semibold">
          {t("header.noConversation.title")}
        </h2>
        <button
        onClick={toggleConversationList}
        className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1 cursor-pointer"
        aria-label={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
        title={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
      >
        <HiBars3 size={30} title="Show Conversations" />
      </button>
      </div>
    );
  }

  // Loading and error states
  if (isLoading || isParticipantsLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  // Convert direct chat to group
  const handleConvertToGroup = async () => {
    try {
      await updateConversation({ conversation, updates: { avatar_url: "/public/group.png", is_group: true, title: t("header.group.untitled") } });
    } catch (err) {
      console.error("Failed to convert to group chat:", err.message);
    } finally {
    setIsConvertConfirmOpen(false);
  }
  };

  // Resolve avatar and title based on chat type
  const avatarUrl = isGroup
    ? conversation?.avatar_url
    : otherProfile?.avatar_url;

  const title = isGroup
    ? conversation?.title
    : otherProfile?.username;

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 bg-gradient-to-l from-gray-900 px-4 py-2 border-b-2 border-sky-600">
      <div className="flex items-center gap-4 w-full relative">
        {/* Avatar and Title */}
        {conversation?.avatar_url ? (
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Group Avatar"
              className="w-10 h-10 bg-amber-600 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm">
            {title?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <h2 className="text-lg font-semibold text-white">{title || t("header.group.untitled")}</h2>
        {/* Group Overview Button for md+ screens */}
        {isGroup && (
          <button
            onClick={() => setIsGroupOverviewOpen(true)}
            className="ml-auto px-2 py-1 bg-sky-700 text-white rounded hover:bg-sky-800 transition text-xs font-semibold items-center gap-1 hidden md:flex"
            style={{ marginLeft: 'auto' }}
            title={t("header.group.info")}
          >
            <HiInformationCircle size={18} className="inline-block text-base text-gray-300" />
            {t("header.group.info")}
          </button>
        )}
        {/* Three dots menu for direct chats, far right */}
        {!isGroup && (
          <div className="ml-auto relative flex items-center">
            <button
              className="p-1 rounded-full hover:bg-gray-800 text-gray-300"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t("header.menu.open")}
            >
              <HiEllipsisVertical size={22} />
            </button>
            {menuOpen && (
              <div className="absolute right-7 mt-28 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                <ul className="py-1">
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                      onClick={() => {
                        if (otherParticipant?.profile_id) navigate(`/profile/${otherParticipant.profile_id}`);
                        setMenuOpen(false);
                      }}
                    >
                      {t("groupOverview.actions.viewProfile")}
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm border-t border-gray-700 hover:bg-sky-700 text-white"
                      onClick={() => {
                        setIsConvertConfirmOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      {t("header.buttons.convertToGroup")}
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-sm border-t border-gray-700 hover:bg-red-700 text-white"
                      onClick={() => {
                        setIsLeaveConfirmOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      {t("header.buttons.leaveConversation")}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
        {!isGroup && (
          <ConfirmDialog
            isOpen={isLeaveConfirmOpen}
            title={t("header.leave.title")}
            message={t("header.leave.directMessage")}
            confirmLabel={t("header.leave.confirm")}
            cancelLabel={t("header.leave.cancel")}
            onConfirm={handleLeaveConversation}
            onCancel={() => setIsLeaveConfirmOpen(false)}
            color="error"
          />
        )}
        <ConfirmDialog
          isOpen={isConvertConfirmOpen}
          title={t("header.convert.title")}
          message={t("header.convert.message")}
          confirmLabel={t("header.convert.confirm")}
          cancelLabel={t("header.convert.cancel")}
          onConfirm={handleConvertToGroup}
          onCancel={() => setIsConvertConfirmOpen(false)}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        />
        {/* Menu to show conversations*/}
        <button
          onClick={toggleConversationList}
          className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1"
          aria-label={isConversationListVisible ? t("header.buttons.hideList") : t("header.buttons.showList")}
          title={isConversationListVisible ? t("header.buttons.hideList") : t("header.buttons.showList")}
        >
          <HiBars3 size={30}/>
        </button>
      </div>
      {/* Group Overview Button for small screens (below avatar/title) */}
      {isGroup && (
        <button
          onClick={() => setIsGroupOverviewOpen(true)}
          className="mt-2 mr-auto px-2 py-1 bg-sky-700 text-white rounded hover:bg-sky-800 transition text-xs font-semibold flex items-center gap-1 md:hidden"
          title={t("header.group.info")}
        >
          <HiInformationCircle size={20} className="inline-block text-base text-gray-300" />
          {t("header.group.info")}
        </button>
      )}
      {/* GroupOverview Modal */}
      {isGroupOverviewOpen && (
        <GroupOverview
          conversation={conversation}
          onClose={() => setIsGroupOverviewOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;
