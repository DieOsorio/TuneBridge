import { useState, useRef, useEffect } from "react";
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../../../context/profile/ProfileContext";
import { HiCamera, HiPencil, HiOutlineUserRemove, HiUserGroup } from "react-icons/hi";
import ImageUploader from "../../../utils/ImageUploader";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import { uploadFileToBucket } from "../../../utils/avatarUtils";

function ParticipantRow({ participant, isSelf, isAdmin, menuOpen, setMenuOpen, setConfirmDialog, navigate, t }) {
  const { fetchProfile } = useProfile();
  const profile = fetchProfile(participant.profile_id)?.data;
  const buttonRef = useRef();
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (menuOpen === participant.profile_id && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = 140; // px, adjust if your menu is taller
      if (rect.bottom + menuHeight > window.innerHeight) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [menuOpen, participant.profile_id]);

  return (
    <li className="flex items-center justify-between py-2" key={participant.profile_id}>
      <div className="flex items-center gap-2">
        <ProfileAvatar
          avatar_url={profile?.avatar_url}
          gender={profile?.gender}
          className="!w-8 !h-8"
        />
        <span className="text-white font-medium">{profile?.username || participant.profile_id}</span>
        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${participant.role === 'admin' ? 'bg-sky-700 text-white' : 'bg-gray-700 text-gray-200'}`}>{t(`groupOverview.role.${participant.role}`)}</span>
      </div>
      {!isSelf && isAdmin && (
        <div className="relative">
          <button
            ref={buttonRef}
            className="p-1 rounded-full cursor-pointer hover:bg-gray-800 text-gray-300"
            onClick={() => setMenuOpen(menuOpen === participant.profile_id ? null : participant.profile_id)}
            aria-label={t("groupOverview.menu.open")}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><circle cx="4" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="16" cy="10" r="2"/></svg>
          </button>
          {menuOpen === participant.profile_id && (
            <div className={`absolute right-0 w-45 bg-gray-800 border border-gray-700 rounded shadow-lg z-10 ${openUpwards ? 'bottom-full mb-2' : 'mt-2'}`}>
              <ul className="py-1">
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                    onClick={() => {
                      navigate(`/profile/${participant.profile_id}`);
                      setMenuOpen(null);
                    }}
                  >
                    {t("groupOverview.actions.viewProfile")}
                  </button>
                </li>
                {participant.role !== "admin" && (
                  <li>
                    <button
                      className="w-full text-left border-t border-gray-700 px-4 py-2 text-sm hover:bg-sky-700 text-white"
                      onClick={() => setConfirmDialog({ open: true, action: "promote", participant })}
                    >
                      {t("groupOverview.actions.promote")}
                    </button>
                  </li>
                )}
                <li>
                  <button
                    className="w-full text-left border-t border-gray-700 px-4 py-2 text-sm hover:bg-red-700 text-white"
                    onClick={() => setConfirmDialog({ open: true, action: "remove", participant })}
                  >
                    {t("groupOverview.actions.remove")}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function GroupOverview({ conversation, onClose }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(null);
  const { updateConversation } = useConversations();
  const { fetchParticipants, addParticipant, removeParticipant, updateParticipantRole } = useParticipants();
  const { data: participants = [] } = fetchParticipants(conversation.id);
  const { searchProfiles } = useProfile();
  const { t } = useTranslation("chat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(conversation.title || "");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const avatarTriggerRef = useRef();
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, participant: null });
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const { register, watch } = useForm();
  const searchTerm = watch("searchTerm");

  // Search results and filtering logic
  const participantsIds = participants.map((p) => p.profile_id) || [];
  const { data: searchResults, isLoading: isSearching } = searchProfiles(searchTerm);
  const filteredResults = searchResults?.filter(
    (profile) => !participantsIds.includes(profile.id)
  ) || [];

  const isAdmin = participants.some(
    (p) => p.profile_id === user.id && p.role === "admin"
  );

  const handleGroupAvatarUpload = async (files) => {
    if (!files?.[0] || !conversation.id) return;
    if (isUploading) return;
    setIsUploading(true);
    try {
      setPreview(URL.createObjectURL(files[0]));
      // Use the generalized function to upload the avatar to the correct bucket
      const newUrl = await uploadFileToBucket(
        files[0],
        "chat-group-avatars",
        conversation.id,
        conversation.avatar_url,
        true
      );
      if (newUrl && newUrl !== conversation.avatar_url) {
        await updateConversation({ conversation, updates: { avatar_url: newUrl } });
        setPreview(null); // Clear preview after successful upload
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleTitleEdit = async () => {
    setIsEditingTitle(false);
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== conversation.title) {
      await updateConversation({ conversation, updates: { title: trimmed } });
    }
  };

  const handleConfirm = async () => {
    if (!confirmDialog.participant) return;
    if (confirmDialog.action === "promote") {
      await updateParticipantRole({ conversation_id: conversation.id, profile_id: confirmDialog.participant.profile_id, role: "admin" });
    } else if (confirmDialog.action === "remove") {
      await removeParticipant({ conversation_id: conversation.id, profile_id: confirmDialog.participant.profile_id });
    }
    // Refetch or invalidate participants to avoid duplicates after update
    if (typeof fetchParticipants.invalidate === 'function') {
      fetchParticipants.invalidate(conversation.id);
    }
    setConfirmDialog({ open: false, action: null, participant: null });
    setMenuOpen(null);
  };

  const handleLeaveGroup = async () => {
    setIsLeaveConfirmOpen(false);
    if (!conversation || !user?.id) return;
    await removeParticipant({ conversation_id: conversation.id, profile_id: user.id });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-3xl text-white">✕</button>
        {/* Leave group button at the top for any member */}
        <div className="flex justify-start mb-4">
          <button
            onClick={() => setIsLeaveConfirmOpen(true)}
            className="text-red-400 hover:text-red-600 transition text-sm font-semibold flex items-center gap-1"
            title={t("header.buttons.leaveGroup")}
          >
            <HiOutlineUserRemove size={18} />
            {t("header.buttons.leaveGroup")}
          </button>
        </div>
        <ConfirmDialog
          isOpen={isLeaveConfirmOpen}
          title={t("header.leave.title")}
          message={t("header.leave.groupMessage")}
          confirmLabel={t("header.leave.confirm")}
          cancelLabel={t("header.leave.cancel")}
          onConfirm={handleLeaveGroup}
          onCancel={() => setIsLeaveConfirmOpen(false)}
          color="error"
        />
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <ProfileAvatar
              avatar_url={preview || conversation.avatar_url}
              className="w-20 h-20 bg-amber-600"
            />
            {isAdmin && (
              <>
                <button
                  ref={avatarTriggerRef}
                  className="absolute bottom-0 right-0 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-80 transition"
                  title={t("groupOverview.avatar.edit")}
                  disabled={isUploading}
                >
                  <HiCamera className="w-5 h-5 cursor-pointer" />
                </button>
                <ImageUploader
                  onFilesUpdate={handleGroupAvatarUpload}
                  amount={1}
                  triggerRef={avatarTriggerRef}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyDown={(e) => e.key === "Enter" && handleTitleEdit()}
                autoFocus
                className="bg-transparent border-b border-sky-500 text-lg font-semibold text-white focus:outline-none"
                disabled={!isAdmin}
              />
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">{editedTitle || "Untitled Group"}</h2>
                {isAdmin && (
                  <HiPencil
                    onClick={() => setIsEditingTitle(true)}
                    className="text-white cursor-pointer hover:text-sky-400 transition text-base"
                    title={t("groupOverview.title.edit")}
                  />
                )}
              </>
            )}
          </div>
          {/* Add participants searchbar for admins */}
          {isAdmin && (
            <div className="w-full mt-2">
              <input
                type="text"
                {...register("searchTerm")}
                placeholder={t("header.search.placeholder")}
                className="w-full p-2 rounded-md bg-neutral-800 text-white text-sm border border-neutral-600"
              />
              {isSearching && (
                <span className="text-sm text-gray-400 mt-1 block">
                  {t("header.search.searching")}
                </span>
              )}
              <div className="mt-2 flex flex-col gap-2">
                {filteredResults.map((profile) => (
                  <div key={profile.id} className="flex items-center gap-2 bg-gray-800 rounded p-2">
                    <ProfileAvatar 
                    avatar_url={profile.avatar_url}
                    gender={profile.gender}
                    className="!w-8 !h-8"
                    />
                    <span className="text-white font-medium">{profile.username}</span>
                    <button
                      className="ml-auto px-2 py-1 bg-sky-700 text-white rounded hover:bg-sky-800 text-xs font-semibold"
                      onClick={() => addParticipant({ conversation_id: conversation.id, profile_id: profile.id })}
                    >
                      {t("header.search.toggle")}
                    </button>
                  </div>
                ))}
                {!isSearching && searchTerm && filteredResults.length === 0 && (
                  <span className="text-sm text-gray-500">
                    {t("header.search.noResults")}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <HiUserGroup /> {t("groupOverview.participants")}
          </h3>
          <ul className="divide-y divide-gray-700">
            {[...new Map(participants.map(p => [p.profile_id, p])).values()].map((p) => {
              const isSelf = user.id === p.profile_id;
              return (
                <ParticipantRow
                  key={p.profile_id}
                  participant={p}
                  isSelf={isSelf}
                  isAdmin={isAdmin}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  setConfirmDialog={setConfirmDialog}
                  navigate={navigate}
                  t={t}
                />
              );
            })}
          </ul>
        </div>
      </div>
      {/* ConfirmDialog for promote/remove */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.action === "remove" ? `${t("groupOverview.actions.remove")}?` : `${t("groupOverview.actions.promote")}?`}
        confirmLabel={t("groupOverview.actions.confirm")}
        cancelLabel={t("groupOverview.actions.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false, action: null, participant: null })}
        color={confirmDialog.action === "remove" ? "error" : "success"}
      />
    </div>
  );
}
