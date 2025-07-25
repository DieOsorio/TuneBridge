import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import ErrorMessage from "../../../utils/ErrorMessage";
import ConversationItem from "./ConversationItem";
import { useAuth } from "../../../context/AuthContext";
import { useChatUI } from "../../../context/social/chat/ChatUIContext";
import { useTranslation } from "react-i18next";
import ConversationItemSkeleton from "./skeletons/ConversationItemSkeleton";
import { Conversation } from "../../../context/social/chat/conversationsActions"; 

type ConversationListProps = {
  onSelectConversation?: () => void;
};

const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation }) => {
  const { t } = useTranslation("chat");
  const { user } = useAuth();
  const { fetchConversations } = useConversations();
  const { data: conversations, isLoading, error } = fetchConversations(user?.id ?? "");
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);
  const { setIsConversationListVisible } = useChatUI();

  useEffect(() => {
    if (!conversationId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    } else {
      setSelectedId(conversationId);
    }
  }, [conversationId, conversations]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/chat/${id}`);
    setIsConversationListVisible(false); // Collapse sidebar on selection
    onSelectConversation?.();
  };

  if (isLoading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </>
    );
  }

  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="w-full overflow-y-auto h-full bg-gradient-to-l from-gray-900 border-r-2 border-sky-700">
      {conversations?.length ? (
        conversations.map((conversation: Conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onClick={() => handleSelect(conversation.id)}
          />
        ))
      ) : (
        <p className="text-gray-400 p-4">
          {t("list")}
        </p>
      )}
    </div>
  );
};

export default ConversationList;
