import MessageItem from "./MessageItem";

const MessageList = ({ messages, profileId }) => {
  return (
    <div className="space-y-4">
      {messages?.map((message) => {
        const isMine = message.sender_profile_id === profileId;
        return (
          <MessageItem
            key={message.id}
            message={message}
            isMine={isMine}
          />
        );
      })}
    </div>
  );
};

export default MessageList;
