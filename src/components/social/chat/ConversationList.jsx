import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import ConversationItem from "./ConversationItem";
import { useAuth } from "../../../context/AuthContext";
import { useChatUI } from "../../../context/social/chat/ChatUIContext";

const ConversationList = () => {
  const { user } = useAuth();
  const { fetchConversations } = useConversations();
  const { data: conversations, isLoading, error } = fetchConversations(user.id);
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(conversationId);
  const { setIsConversationListVisible } = useChatUI();
  
  
  useEffect(() => {
    if (!conversationId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    } else {
      setSelectedId(conversationId);
    }
  }, [conversationId, conversations]);

  const handleSelect = (id) => {
    setSelectedId(id);
    navigate(`/chat/${id}`);
    setIsConversationListVisible(false); // Collapse sidebar on selection
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="w-full overflow-y-auto h-full bg-gradient-to-l from-gray-900 border-r-2 border-sky-700">
      {conversations?.length ? (
        conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedId === conversation.id}
            onClick={handleSelect}
          />
        ))
      ) : (
        <p className="text-gray-400 p-4">No conversations found.</p>
      )}
    </div>
  );
};

export default ConversationList;
