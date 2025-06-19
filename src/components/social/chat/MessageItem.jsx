import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useProfile } from "../../../context/profile/ProfileContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useState, useRef, useEffect } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useTranslation } from "react-i18next";

// Deterministic color by profile ID (consistent across messages)
const getColorForProfile = (profileId) => {
  const colors = [
    "bg-emerald-600",
    "bg-yellow-700",
    "bg-purple-700",
    "bg-green-800",
    "bg-red-800",
    "bg-pink-800",
    "bg-indigo-500",
    "bg-blue-800",
    "bg-orange-700",
    "bg-teal-600",
    "bg-fuchsia-800",
    "bg-cyan-700",
    "bg-lime-700",
    "bg-rose-800",
    "bg-violet-600"
  ];
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = profileId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const MessageItem = ({ message, isMine }) => {
  const { t } = useTranslation("chat");
  const { deleteMessage, updateMessage } = useMessages();
  const { fetchProfile } = useProfile();
  const { data: senderProfile, isLoading } = fetchProfile(message.sender_profile_id);

  // Check if the message was delivered
  const wasDelivered = Array.isArray(message.delivered_to) && message.delivered_to.length > 0;
  // Check if the message was read
  const wasRead = Array.isArray(message.read_by) && message.read_by.length > 0;

  // Determine bubble color based on sender profile or if it's the user's own message
  const bubbleColor = isMine
    ? "bg-sky-700 text-white"
    : getColorForProfile(message.sender_profile_id) + " text-white";

  // Editable message state
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleEdit = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleEditSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      updateMessage({ id: message.id, conversation_id: message.conversation_id, updatedFields: { content: editedContent } });
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage({ id: message.id, conversation_id: message.conversation_id });
    setMenuOpen(false);
  }

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} space-x-2`}>
      {!isMine && (
        <div className="flex flex-col items-start max-w-xs">
          <span className="text-xs font-medium text-sky-300 mb-1">
            {isLoading ? (
              <Skeleton width={80} height={12} baseColor="#333" highlightColor="#444" />
            ) : (
              `${senderProfile?.firstname || "Unknown"} ${senderProfile?.lastname || ""}`.trim()
            )}
          </span>
          {isLoading ? (
            <Skeleton height={32} width={200} baseColor="#333" highlightColor="#444" />
          ) : (
            <div className={`${bubbleColor} p-2 rounded-lg min-w-[80px] text-center`}>
              {message.content}
            </div>
          )}
        </div>
      )}

      {isMine && (
        <div className="flex flex-col items-end max-w-xs relative">
          <div className={`${bubbleColor} p-3 rounded-lg relative pr-6 min-w-[80px]`}>
            {isEditing ? (
              <input
                type="text"
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                onBlur={handleEditSave}
                onKeyDown={e => {
                  if (e.key === "Enter") handleEditSave();
                  if (e.key === "Escape") handleEditCancel();
                }}
                placeholder={t("message.edit.placeholder")}
                autoFocus
                className="bg-sky-900 text-white border-b border-sky-400 focus:outline-none w-full px-1 rounded"
              />
            ) : (
              <>
                <span className="mr-2">{message.content}</span>
                <span className="absolute bottom-1 right-1 text-xs text-white">
                  {wasRead ? (
                    <FaCheckDouble 
                    className="text-green-200"
                    title="Read"
                    />
                  ) : wasDelivered ? (
                    <FaCheck 
                    className="text-blue-200"
                    title="Delivered"
                    />
                  ) : null}
                </span>
                {/* Three dots menu */}
                <button
                  className="absolute top-1/2 -translate-y-1/2 right-1 text-white hover:text-sky-400 p-1"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Message options"
                >
                  <FiMoreVertical size={18} />
                </button>
                {menuOpen && (
                  <div ref={menuRef} className="absolute z-10 right-5 top-6 bg-gray-900 border border-sky-700 rounded shadow-lg py-1 w-37 flex flex-col">
                    <button
                      className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-red-400"
                      onClick={handleDelete}
                    >
                      {t("message.delete.title")}
                    </button>
                    <div className="border-t border-sky-700" />
                    <button
                      className="px-4 py-2 text-left hover:bg-gray-800 text-sm text-yellow-500"
                      onClick={handleEdit}
                    >
                      {t("message.edit.title")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
