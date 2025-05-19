// Context and utility imports
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { Link } from "react-router-dom";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import MiniProfileCard from "./MiniProfileCard";
import { useAuth } from "../../../context/AuthContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useProfile } from "../../../context/profile/ProfileContext";
import { useForm } from "react-hook-form";
import { HiUserGroup, HiMinus, HiPlus, HiPencil } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { uploadFileToBucket } from "../../../utils/avatarUtils";
import ImageUploader from "../../../utils/ImageUploader";
import { HiCamera } from "react-icons/hi";
import { HiBars3 } from 'react-icons/hi2';
import { useChatUI } from "../../../context/social/chat/ChatUIContext";


const ChatHeader = ({ conversationId }) => {
  // Fetch conversation data and update logic
  const { fetchConversation, updateConversation } = useConversations();
  const { data: conversation, isLoading, error } = fetchConversation(conversationId);

  // Auth info to identify current user
  const { user } = useAuth();

  // Fetch participants of the conversation
  const { fetchParticipants, addParticipant } = useParticipants();
  const { data: participants, isLoading: isParticipantsLoading } = fetchParticipants(conversationId);

  // Fetch current user profile and search logic
  const { fetchProfile, searchProfiles } = useProfile();

  // UI state: search input visibility, edit mode, and title buffer
  const [searchVisible, setSearchVisible] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation?.title || "");
  const [isUploading, setIsUploading] = useState(false);
  const { isConversationListVisible, toggleConversationList } = useChatUI();

  // Get the other participant's profile in direct chats
  const otherParticipant = participants?.find((p) => p.profile_id !== user.id);
  const { data: otherProfile } = fetchProfile(otherParticipant?.profile_id);

  // Form handling for search input
  const { register, watch } = useForm();
  const searchTerm = watch("searchTerm");

  // Search results and filtering logic
  const { data: searchResults, isLoading: isSearching } = searchProfiles(searchTerm);
  const participantsIds = participants?.map((p) => p.profile_id) || [];
  const filteredResults = searchResults?.filter(
    (profile) => !participantsIds.includes(profile.id)
  ) || [];

  const isGroup = conversation?.is_group;
  const avatarTriggerRef = useRef();

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
        <h2 className="text-lg font-semibold">Select a conversation</h2>
        <button
        onClick={toggleConversationList}
        className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1"
        aria-label={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
        title={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
      >
        <HiBars3 size={30}/>
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

              <button
                ref={avatarTriggerRef}
                className="absolute bottom-0 right-0 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-80 transition"
                title="Edit group avatar"
              >
                <HiCamera
                  title="Edit chat-group image"
                  className="w-4 h-4 cursor-pointer"
                />
              </button>

              <ImageUploader
                onFilesUpdate={handleGroupAvatarUpload}
                amount={1}
                triggerRef={avatarTriggerRef}
              />
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
              className="bg-transparent border-b border-sky-500 text-lg font-semibold text-white focus:outline-none"
            />
          ) : (
            <>
              <h2
                className="text-lg font-semibold text-white cursor-pointer group-hover:underline"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit group title"
              >
                {editedTitle || "Untitled"}
              </h2>
              <HiPencil
                onClick={() => setIsEditingTitle(true)}
                className="text-white cursor-pointer hover:text-sky-400 transition text-base"
                title="Edit title"
              />
            </>
          )}
        </div>
      ) : (
        <h2 className="text-lg font-semibold">{title || "Untitled"}</h2>
      )}

      {/* Menu to show conversations*/}
      <button
        onClick={toggleConversationList}
        className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1"
        aria-label={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
        title={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
      >
        <HiBars3 size={30}/>
      </button>

      {/* Convert direct chat to group button */}
      {!isGroup && (
        <button
          onClick={handleConvertToGroup}
          className="ml-auto text-white hover:text-sky-400 transition text-xl"
          title="Convert to group chat"
        >
          <HiUserGroup title="Convert to group chat" />
        </button>
      )}
    </div>

    {/* Right side: search and add participants */}
    {isGroup && (
      <div className="flex flex-col items-center w-full md:w-auto md:items-end md:mt-0">
        {/* Toggle search visibility */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white font-semibold">Add participants</span>
          <button
            onClick={() => setSearchVisible((prev) => !prev)}
            className="text-white text-lg hover:text-sky-400 transition ml-3"
            title={searchVisible ? "Hide search" : "Show search"}
          >
            {searchVisible ? <HiMinus title="Hide searchbar" /> : <HiPlus title="Show searchbar" />}
          </button>
        </div>

        {/* Search input and results */}
        {searchVisible && (
          <>
            <input
              type="text"
              {...register("searchTerm")}
              placeholder="Search profiles..."
              className="mt-2 p-1 rounded-md bg-neutral-800 text-white text-sm border border-neutral-600"
            />
            {isSearching && <span className="text-sm text-gray-400 mt-1">Searching...</span>}
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
                <span className="text-sm text-gray-500">No profiles found.</span>
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
