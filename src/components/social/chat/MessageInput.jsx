import { useState } from "react";
import { useMessages } from "../../../context/social/chat/MessagesContext";

const MessageInput = ({ conversationId, senderId }) => {
  const [content, setContent] = useState("");
  const { insertMessage } = useMessages();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await insertMessage({
      content,
      sender_profile_id: senderId,
      conversation_id: conversationId,
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
        className="flex-1 resize-none rounded-lg border border-neutral-700 bg-neutral-900 text-white p-2 outline-none focus:ring-1 focus:ring-neutral-500"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;
