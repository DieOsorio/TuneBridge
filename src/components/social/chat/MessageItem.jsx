const MessageItem = ({ message, isMine }) => {
  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"} space-x-2`}
    >
      {!isMine && (
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold">{message.sender_name}</span>
          <div className="bg-gray-700 p-2 rounded-lg max-w-xs">{message.content}</div>
        </div>
      )}
      {isMine && (
        <div className="flex flex-col items-end">
          <div className="bg-sky-700 text-white p-2 rounded-lg max-w-xs">{message.content}</div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
