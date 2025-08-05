import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConversations } from "@/context/social/chat/ConversationsContext";
import { useChatUI } from "@/context/social/chat/ChatUIContext";
import { useAuth } from "@/context/AuthContext";
import { useParticipants } from "@/context/social/chat/ParticipantsContext";

import ErrorMessage from "@/utils/ErrorMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ConversationAttachments from "./ConversationAttachments";
import GroupOverview from "./GroupOverview";
import Loading from "@/utils/Loading";

import {
  InformationCircleIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import type { Participant } from "@/context/social/chat/participantsActions";

interface ChatHeaderProps {
  conversationId?: string;
}

interface PaginatedParticipants {
  pages: Participant[][];
  pageParams?: unknown[];
}

const ChatHeader = ({ conversationId }: ChatHeaderProps) => {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const { t } = useTranslation("chat");

  const { 
    fetchConversation, 
    fetchConversations, 
    updateConversation, 
    deleteConversation 
  } = useConversations();
  const { data: conversation, isLoading, error } = fetchConversation(conversationId ?? "");
  const { refetch: refetchConversations } = fetchConversations(userId);

  const { fetchParticipants, removeParticipant } = useParticipants();
  const participantsData = fetchParticipants(conversationId ?? "").data as Participant[] | PaginatedParticipants | undefined;

  // Type guard to check if participantsData is paginated
  function isPaginated(data: any): data is PaginatedParticipants {
    return data && typeof data === "object" && Array.isArray(data.pages);
  }

  // Flatten participants safely respecting possible pagination
  let safeParticipants: Participant[] = [];
  if (Array.isArray(participantsData)) {
    safeParticipants = participantsData;
  } else if (isPaginated(participantsData)) {
    safeParticipants = participantsData.pages.flat();
  } else if (!participantsData) {
    safeParticipants = [];
  } else {
    // unexpected shape, log error and fallback
    console.error("participantsData unexpected shape", participantsData);
    safeParticipants = [];
  }

  const navigate = useNavigate();
  
  const otherParticipant = safeParticipants.find((p) => p.profile_id !== userId);

  const isGroup = conversation?.is_group ?? false;

  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isConvertConfirmOpen, setIsConvertConfirmOpen] = useState(false);
  const [isGroupOverviewOpen, setIsGroupOverviewOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  const { isConversationListVisible, toggleConversationList } = useChatUI();

  // Fix role missing in removeParticipant params: find current user's participant object
  const currentUserParticipant = safeParticipants.find((p) => p.profile_id === userId);

  const handleLeaveConversation = async () => {
    try {
      setIsLeaveConfirmOpen(false);
      if (!conversation || !userId) return;

      if (isGroup) {
        if (!currentUserParticipant) {
          console.error("Current user participant info missing, can't remove");
          return;
        }
        // Pass role here as required
        await removeParticipant({
          conversation_id: conversation.id,
          profile_id: userId,
          role: currentUserParticipant.role,
        });
      } else {
        await deleteConversation(conversation);
      }
      navigate("/chat");
      refetchConversations();
    } catch (error: any) {
      console.error("Failed to leave conversation:", error.message);
    }
  };


  if (!conversationId) {
    return (
      <div className="flex items-center gap-4 px-4 py-2 border-b border-sky-600">
        <h2 className="text-lg font-semibold">{t("header.noConversation.title")}</h2>
        <button
          onClick={toggleConversationList}
          className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1 cursor-pointer"
          aria-label={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
          title={isConversationListVisible ? "Hide conversation list" : "Show conversation list"}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  // Guard updateConversation calls with conversation existence check
  const handleConvertToGroup = async () => {
    if (!conversation) return;
    try {
      await updateConversation({
        conversation,
        updates: {
          avatar_url: "/public/group.png",
          is_group: true,
          title: t("header.group.untitled"),
        },
      });
    } catch (err: any) {
      console.error("Failed to convert to group chat:", err.message);
    } finally {
      setIsConvertConfirmOpen(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 bg-gradient-to-l from-gray-900 px-4 py-2 border-b-2 border-sky-600">
      <div className="flex items-center gap-4 w-full relative">
        {/* Avatar and Title */}
        {conversation?.avatar_url ? (
          <div className="relative">
            <img
              src={conversation?.avatar_url}
              alt="Group Avatar"
              className="w-10 h-10 bg-amber-600 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center text-white text-sm">
            {conversation?.title?.charAt(0).toUpperCase() ?? "?"}
          </div>
        )}
        <h2 className="text-lg font-semibold text-white">{conversation?.title ?? t("header.group.untitled")}</h2>

        {/* Group Overview Button for md+ */}
        {isGroup && (
          <button
            onClick={() => setIsGroupOverviewOpen(true)}
            className="ml-auto px-2 py-1 cursor-pointer bg-sky-700 text-white rounded hover:bg-sky-800 transition text-xs font-semibold items-center gap-1 hidden md:flex"
            title={t("header.group.info")}
          >
            <InformationCircleIcon className="h-6 w-6 inline-block text-base text-gray-300" />
            {t("header.group.info")}
          </button>
        )}

        {/* Direct chat menu */}
        {!isGroup && (
          <div className="ml-auto relative flex items-center">
            <button
              className="p-1 w-[32px] h-[32px] rounded-full hover:bg-gray-800 cursor-pointer text-gray-300 relative"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={t("header.menu.open")}
            >
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out ${
                  menuOpen ? "opacity-0 scale-90" : "opacity-100 scale-100"
                }`}
              >
                <EllipsisVerticalIcon className="h-6 w-6" />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out ${
                  menuOpen ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
              >
                <XMarkIcon className="h-6 w-6" />
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-8 top-5 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                <ul className="py-1">
                  <li>
                    <button
                      className="w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                      onClick={() => {
                        if (otherParticipant?.profile_id)
                          navigate(`/profile/${otherParticipant.profile_id}`);
                        setMenuOpen(false);
                      }}
                    >
                      {t("groupOverview.actions.viewProfile")}
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full cursor-pointer text-left px-4 py-2 text-sm border-t border-gray-700 hover:bg-gray-700 text-white"
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
                      className="w-full cursor-pointer text-left px-4 py-2 text-sm border-t border-gray-700 hover:bg-gray-700 text-white"
                      onClick={() => {
                        setIsAttachmentsOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      {t("header.buttons.attachments")}
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full cursor-pointer text-left px-4 py-2 text-sm border-t border-gray-700 hover:bg-rose-700 text-white"
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

        {/* Confirm dialogs for leave and convert */}
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

        {/* Button to toggle conversation list */}
        <button
          onClick={toggleConversationList}
          className="md:hidden text-white bg-sky-600 text-2xl mr-2 ml-auto rounded-md p-1"
          aria-label={isConversationListVisible ? t("header.buttons.hideList") : t("header.buttons.showList")}
          title={isConversationListVisible ? t("header.buttons.hideList") : t("header.buttons.showList")}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Group Overview button for small screens */}
      {isGroup && (
        <button
          onClick={() => setIsGroupOverviewOpen(true)}
          className="mt-2 mr-auto px-2 py-1 bg-sky-700 text-white rounded hover:bg-sky-800 transition text-xs font-semibold flex items-center gap-1 md:hidden"
          title={t("header.group.info")}
        >
          <InformationCircleIcon className="h-6 w-6 inline-block text-base text-gray-300" />
          {t("header.group.info")}
        </button>
      )}

      {/* GroupOverview modal */}
      {isGroupOverviewOpen && conversation && (
        <GroupOverview 
          conversation={conversation} 
          onClose={() => setIsGroupOverviewOpen(false)} 
        />
      )}

      {isAttachmentsOpen && conversation?.message_attachments && (
        <ConversationAttachments
          attachments={conversation.message_attachments}
          onClose={() => setIsAttachmentsOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;
