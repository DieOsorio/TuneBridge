import { 
  useState, 
  FormEvent, 
  KeyboardEvent, 
  useRef, 
  useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMessages } from "@/context/social/chat/MessagesContext";
import { useMessageAttachments } from "@/context/social/chat/MessageAttachmentsContext";
import { useParticipants } from "@/context/social/chat/ParticipantsContext";
import { useBannedUsers } from "@/context/admin/BannedUsersContext";

import { FiPaperclip } from "react-icons/fi";
import { uploadFileToBucket } from "@/utils/avatarUtils";

import type { Message } from "@/context/social/chat/messagesActions";
import type { MessageAttachment } from "@/context/social/chat/messageAttachmentsActions";

type MessageInputProps = {
  conversationId: string;
  senderId: string;
};

const MessageInput = ({ conversationId, senderId }: MessageInputProps) => {
  const { t } = useTranslation("chat");
  const [content, setContent] = useState<string>("");
  const { insertMessage } = useMessages();
  const { insertMessageAttachment } = useMessageAttachments();
  const { fetchParticipants } = useParticipants();
  const { data: participants = [] } = fetchParticipants(conversationId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { bannedUser } = useBannedUsers();
  const navigate = useNavigate();

  useEffect(() => {
    if (bannedUser?.type === "messaging") {
      navigate("/banned");
    }
  }, [bannedUser, navigate]);

  const isBannedMessaging = bannedUser?.type === "messaging";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isBannedMessaging) return;
    if (!content.trim()) return;

    const deliveredTo: string[] =
      participants
        ?.map((participant) => participant.profile_id)
        .filter((id) => id !== senderId) ?? [];

    await insertMessage({
      content,
      sender_profile_id: senderId,
      conversation_id: conversationId,
      delivered_to: deliveredTo,
    } as Message);

    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isBannedMessaging) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleAttachmentClick = () => {
    if (isBannedMessaging) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBannedMessaging) return;
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);

    try {
      const attachmentUrl = await uploadFileToBucket(file, "message-attachments", conversationId);

      if (!attachmentUrl) {
        alert(t("uploadFailed"));
        setUploading(false);
        return;
      }

      const newAttachment = await insertMessageAttachment({
        conversation_id: conversationId,
        profile_id: senderId,
        url: attachmentUrl,
        mime_type: file.type,
      } as MessageAttachment);

      const deliveredTo: string[] =
        participants
          ?.map((participant) => participant.profile_id)
          .filter((id) => id !== senderId) ?? [];

      await insertMessage({
        content: "",
        sender_profile_id: senderId,
        conversation_id: conversationId,
        delivered_to: deliveredTo,
        attachment_id: newAttachment.id,
      } as Message);

      setContent("");
    } catch (error) {
      console.error("Upload or insert failed:", error);
      alert(t("uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <textarea
        rows={1}
        value={content}
        maxLength={3000}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("input.placeholder")}
        className="flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-950 text-white p-2 outline-none focus:ring-1 focus:ring-neutral-500"
        disabled={uploading || isBannedMessaging}
      />
      <button
        type="button"
        onClick={handleAttachmentClick}
        title={t("input.attachFile")}
        disabled={uploading || isBannedMessaging}
        className="text-white hover:text-sky-400 transition text-xl p-2"
      >
        <FiPaperclip />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/aac,audio/flac,audio/mp4,audio/x-wav,audio/x-m4a"
      />
      <button
        type="submit"
        className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition"
        disabled={uploading || isBannedMessaging}
      >
        {uploading ? t("input.uploading") : t("input.button")}
      </button>
    </form>
  );
};

export default MessageInput;
