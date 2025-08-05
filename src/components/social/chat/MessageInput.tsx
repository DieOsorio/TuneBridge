import { useState, FormEvent, KeyboardEvent, useRef } from "react";
import { useMessages } from "@/context/social/chat/MessagesContext";
import { useMessageAttachments} from "@/context/social/chat/MessageAttachmentsContext";
import { useParticipants } from "@/context/social/chat/ParticipantsContext";
import { useTranslation } from "react-i18next";
import { Message } from "@/context/social/chat/messagesActions";
import { uploadFileToBucket } from "@/utils/avatarUtils";
import { FiPaperclip } from "react-icons/fi";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

   const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);

    try {
      // 1) Upload file to bucket
      const attachmentUrl = await uploadFileToBucket(file, "message-attachments", conversationId);

      if (!attachmentUrl) {
        alert(t("uploadFailed"));
        setUploading(false);
        return;
      }

      // 2) Insert attachment record in DB via context
      const newAttachment = await insertMessageAttachment({
        conversation_id: conversationId,
        profile_id: senderId,
        url: attachmentUrl,
        mime_type: file.type,
      } as MessageAttachment);

      // 3) Insert message con referencia a attachment
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
        disabled={uploading}
      />
      <button
        type="button"
        onClick={handleAttachmentClick}
        title={t("input.attachFile")}
        disabled={uploading}
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
        disabled={uploading}
      >
        {uploading ? t("input.uploading") : t("input.button")}
      </button>
    </form>
  );
};

export default MessageInput;
