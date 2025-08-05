import { useState, useRef } from "react";
import { useProfile } from "@/context/profile/ProfileContext";
import { useMessages } from "@/context/social/chat/MessagesContext";
import { Message } from "@/context/social/chat/messagesActions";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { deleteFileFromBucket } from "@/utils/avatarUtils";

import { useTranslation } from "react-i18next";
import { EllipsisVerticalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { FaCheck, FaCheckDouble } from "react-icons/fa";

interface MessageItemProps {
  message: Message;
  isMine: boolean;
}

const getColorForProfile = (profileId: string): string => {
  const colors = [
    "bg-emerald-600", "bg-yellow-700", "bg-purple-700", "bg-green-800", "bg-red-800",
    "bg-pink-800", "bg-indigo-500", "bg-blue-800", "bg-orange-700", "bg-teal-600",
    "bg-fuchsia-800", "bg-cyan-700", "bg-lime-700", "bg-rose-800", "bg-violet-600"
  ];
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = profileId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const MessageItem = ({ message, isMine }: MessageItemProps) => {
  const { t } = useTranslation("chat");
  const { deleteMessage, updateMessage } = useMessages();
  const { fetchProfile } = useProfile();
  const { data: senderProfile, isLoading } = fetchProfile(message.sender_profile_id);

  const wasDelivered = Array.isArray(message.delivered_to) && message.delivered_to.length > 0;
  const wasRead = Array.isArray(message.read_by) && message.read_by.length > 0;  

  const bubbleColor = isMine
    ? "bg-sky-700 text-white"
    : `${getColorForProfile(message.sender_profile_id)} text-white`;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>(message.content);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleEditSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      updateMessage({
        id: message.id,
        conversation_id: message.conversation_id,
        updatedFields: { content: editedContent, updated_at: new Date().toISOString() },
      });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteFileFromBucket("message-attachments", message.attachment?.url || "");
    deleteMessage({ id: message.id, conversation_id: message.conversation_id });
    setMenuOpen(false);
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} space-x-2`}>
      {!isMine && (
        <div className="flex flex-col items-start max-w-xs">
          <span className="text-xs font-medium text-sky-300 mb-1">
            {isLoading ? (
              <Skeleton width={80} height={12} baseColor="#a1a1aa" highlightColor="#e4e4e7" />
            ) : (
              `${senderProfile?.firstname || "Unknown"} ${senderProfile?.lastname || ""}`.trim()
            )}
          </span>
          {isLoading ? (
            <Skeleton height={32} width={200} baseColor="#a1a1aa" highlightColor="#e4e4e7" />
          ) : (
            <div className={`${bubbleColor} p-2 rounded-lg min-w-[80px] text-center`}>
              {message.attachment ? (
                <>
                  {message.attachment.mime_type?.startsWith("image/") && (
                    <img
                      src={message.attachment.url}
                      alt="attachment"
                      className="max-w-full max-h-60 rounded"
                    />
                  )}
                  {message.attachment.mime_type?.startsWith("audio/") && (
                    <audio controls className="w-75">
                      <source src={message.attachment.url} type={message.attachment.mime_type} />
                      {t("message.audioNotSupported")}
                    </audio>
                  )}
                  {message.content && message.content}
                </>
              ) : (
                message.content
              )}
            </div>
          )}
        </div>
      )}

      {isMine && (
        <div className="flex flex-col items-end max-w-xs relative">
          {/* Menu toggle button */}
          <div className="absolute top-2 z-20">
            <button
              className="w-6 h-6 cursor-pointer text-gray-100 relative"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t("header.menu.open")}
            >
              <span className={`absolute inset-0 flex items-center justify-center transition ${menuOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}>
                <EllipsisVerticalIcon />
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition ${menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                <XMarkIcon />
              </span>
            </button>
          </div>

          {/* Message bubble */}
          <div className={`${bubbleColor} p-1 pr-6 rounded-lg min-w-[80px] flex flex-col gap-1`}>
            {isEditing ? (
              <input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleEditSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditSave();
                  if (e.key === "Escape") handleEditCancel();
                }}
                placeholder={t("message.edit.placeholder")}
                autoFocus
                className="bg-sky-900 text-white border-b border-sky-400 focus:outline-none w-full px-1 rounded"
              />
            ) : (
              <>
                {message.attachment ? (
                  <>
                    {message.attachment.mime_type?.startsWith("image/") && (
                      <img
                        src={message.attachment.url}
                        alt="attachment"
                        className="max-w-full max-h-60 rounded"
                      />
                    )}
                    {message.attachment.mime_type?.startsWith("audio/") && (
                      <audio controls className="w-75">
                        <source src={message.attachment.url} type={message.attachment.mime_type} />
                        {t("message.audioNotSupported")}
                      </audio>
                    )}
                    {message.content && (
                      <span className="mr-2">{message.content}</span>
                    )}
                  </>
                ) : (
                  <span className="mr-2">{message.content}</span>
                )}


                <span className="flex items-center text-xs">
                  {wasRead ? (
                    <FaCheckDouble className="text-green-200 w-4" title="Read" />
                  ) : wasDelivered ? (
                    <FaCheck className="text-blue-200 w-4" title="Delivered" />
                  ) : null}
                </span>
              </>
            )}

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute z-30 right-0 top-10 bg-gray-900 border border-sky-700 rounded shadow-lg py-1 w-37 flex flex-col"
              >
                <button
                  className="cursor-pointer px-4 py-2 text-left hover:bg-gray-800 text-sm text-rose-400"
                  onClick={handleDelete}
                >
                  {t("message.delete.title")}
                </button>
                <div className="border-t border-sky-700" />
                <button
                  className="cursor-pointer px-4 py-2 text-left hover:bg-gray-800 text-sm text-yellow-500"
                  onClick={handleEdit}
                >
                  {t("message.edit.title")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
