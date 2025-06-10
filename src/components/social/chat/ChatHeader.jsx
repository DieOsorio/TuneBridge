// Context and utility imports
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import MiniProfileCard from "./MiniProfileCard";
import { useAuth } from "../../../context/AuthContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";
import { useForm } from "react-hook-form";
import { HiUserGroup, HiMinus, HiPlus, HiPencil, HiOutlineUserRemove, HiOutlineTrash } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { uploadFileToBucket } from "../../../utils/avatarUtils";
import ImageUploader from "../../../utils/ImageUploader";
import { HiCamera } from "react-icons/hi";
import { HiBars3 } from 'react-icons/hi2';
import { useChatUI } from "../../../context/social/chat/ChatUIContext";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../ui/ConfirmDialog";


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
      await updateConversation({ conversation, updates: { is_group: true } });
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
    
    {/* Left side: avatar and title */}
    <div className="flex items-center gap-4">
      {conversation?.avatar_url ? (
        <div className="relative">
          {isGroup ? (
            <>
              <img
                src={conversation.avatar_url}
                alt="Group Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />

              {isAdmin && (
                <>
                  <button
                  ref={avatarTriggerRef}
                  className="absolute bottom-0 right-0 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-80 transition"
                  title={t("header.group.editAvatar")}
                  >
                  <HiCamera
                    title={t("header.group.editAvatar")}
                    className="w-4 h-4 cursor-pointer"
                  />
                  </button>

                  <ImageUploader
                    onFilesUpdate={handleGroupAvatarUpload}
                    amount={1}
                    triggerRef={avatarTriggerRef}
                  />
                </>
              )}
            </>
          ) : (
            <Link to={`/profile/${otherProfile?.id}`}>
              <img
                src={otherProfile?.avatar_url}
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          )}
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm">
          {title?.charAt(0).toUpperCase() || "?"}
        </div>
      )}

      {/* Title with editable logic for group chats */}
      {isGroup ? (
        <div className="flex items-center gap-2 group">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                const trimmed = editedTitle.trim();
                if (trimmed && trimmed !== conversation?.title) {
                  updateConversation({ conversation, updates: { title: trimmed } });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              autoFocus
              className={`bg-transparent border-b ${
                isAdmin ? "border-sky-500" : "border-transparent"
              } text-lg font-semibold text-white focus:outline-none ${
                !isAdmin ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={!isAdmin}
            />
          ) : (
             <>
              <h2
                className={`text-lg font-semibold text-white ${
                  isAdmin ? "cursor-pointer group-hover:underline" : ""
                }`}
                onClick={() => isAdmin && setIsEditingTitle(true)}
                title={isAdmin ? t("header.group.editTitle") : ""}
              >
                {editedTitle || t("header.group.untitled")}
              </h2>
              {isAdmin && (
                <HiPencil
                  onClick={() => setIsEditingTitle(true)}
                  className="text-white cursor-pointer hover:text-sky-400 transition text-base"
                  title={t("header.group.editTitle")}
                />
              )}
            </>
          )}
        </div>
      ) : (
        <h2 className="text-lg font-semibold">{title || t("header.direct.untitled")}</h2>
      )}
      {/* Leave/Delete Chat */}
      <button
        onClick={() => setIsLeaveConfirmOpen(true)}
        className="text-red-400 hover:text-red-600 transition mt-2 md:mt-0 text-sm font-semibold"
        title={t("header.buttons.leaveConversation")}
        color="error"
      >
        {isGroup ? (
          <HiOutlineUserRemove size={18}  />
        ) : (
          <HiOutlineTrash size={18} />
        )}
      </button>

      <ConfirmDialog
        isOpen={isLeaveConfirmOpen}
        title={t("header.leave.title")}
        message={
          isGroup
            ? t("header.leave.groupMessage")
            : t("header.leave.directMessage")
        }
        confirmLabel={t("header.leave.confirm")}
        cancelLabel={t("header.leave.cancel")}
        onConfirm={handleLeaveConversation}
        onCancel={() => setIsLeaveConfirmOpen(false)}
        color="error"
      />
            
      {/* Convert direct chat to group button */}
      {!isGroup && (
        <button
          onClick={() => setIsConvertConfirmOpen(true)}
          className="text-white hover:text-sky-400 transition text-xl"
          title={t("header.buttons.convertToGroup")}
        >
          <HiUserGroup title={t("header.buttons.convertToGroup")} />
        </button>
      )}

      <ConfirmDialog
        isOpen={isConvertConfirmOpen}
        title={t("header.convert.title")}
        message={t("header.convert.message")}
        confirmLabel={t("header.convert.confirm")}
        cancelLabel={t("header.convert.cancel")}
        onConfirm={handleConvertToGroup}
        onCancel={() => setIsConvertConfirmOpen(false)}
        color="success"
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

    {/* Right side: search and add participants */}
    {isGroup && isAdmin && (
      <div className="flex flex-col items-center w-full md:w-auto md:items-end md:mt-0">
        {/* Toggle search visibility */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white font-semibold">
            {t("header.search.toggle")}
          </span>
          <button
            onClick={() => setSearchVisible((prev) => !prev)}
            className="text-white text-lg hover:text-sky-400 transition ml-3"
            title={searchVisible ? t("header.search.hide") : t("header.search.show")}
          >
            {searchVisible ? <HiMinus title={t("header.search.hide")} /> : <HiPlus title={t("header.search.show")} />}
          </button>
        </div>        

        {/* Search input and results */}
        {searchVisible && (
          <>
            <input
              type="text"
              {...register("searchTerm")}
              placeholder={t("header.search.placeholder")}
              className="mt-2 p-1 rounded-md bg-neutral-800 text-white text-sm border border-neutral-600"
            />
            {isSearching && 
            <span className="text-sm text-gray-400 mt-1">
              {t("header.search.searching")}
            </span>}
            <div className="mt-2 flex flex-col gap-2">
              {/* List of profiles not already in the conversation */}
              {filteredResults.map((profile) => (
                <MiniProfileCard
                  key={profile.id}
                  profile={profile}
                  onAdd={() =>
                    addParticipant({
                      conversation_id: conversationId,
                      profile_id: profile.id,
                    })
                  }
                />
              ))}
              {/* No results message */}
              {!isSearching && searchTerm && filteredResults.length === 0 && (
                <span className="text-sm text-gray-500">
                  {t("header.search.noResults")}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    )}
  </div>
);
};

export default ChatHeader;
