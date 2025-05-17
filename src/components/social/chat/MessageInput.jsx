import { useState } from "react";
import { useMessages } from "../../../context/social/chat/MessagesContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";

const MessageInput = ({ conversationId, senderId }) => {
  const [content, setContent] = useState("");
  const { insertMessage } = useMessages();
  const { fetchParticipants } = useParticipants();
  const { data: participants } = fetchParticipants(conversationId);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Extract the profile IDs of participants except the sender
    const deliveredTo = participants
      ?.map((participant) => participant.profile_id)
      .filter((id) => id !== senderId) || [];

    //Insert the message into the database  
    await insertMessage({
      content,
      sender_profile_id: senderId,
      conversation_id: conversationId,
      delivered_to: deliveredTo,
    });

    setContent("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <textarea
        rows={1}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        className="flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-950 text-white p-2 outline-none focus:ring-1 focus:ring-neutral-500"
      />
      <button
        type="submit"
        className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
