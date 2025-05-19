import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useProfile } from "../../../context/profile/ProfileContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Deterministic color by profile ID (consistent across messages)
const getColorForProfile = (profileId) => {
  const colors = [
    "bg-emerald-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < profileId.length; i++) {
    hash = profileId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const MessageItem = ({ message, isMine }) => {
  const { fetchProfile } = useProfile();
  const { data: senderProfile, isLoading } = fetchProfile(message.sender_profile_id);

  const wasDelivered = Array.isArray(message.delivery_to) && message.delivery_to.length > 0;
  const wasRead = Array.isArray(message.read_by) && message.read_by.length > 0;

  const bubbleColor = isMine
    ? "bg-sky-700 text-white"
    : getColorForProfile(message.sender_profile_id) + " text-white";

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
            <div className={`${bubbleColor} p-2 rounded-lg`}>
              {message.content}
            </div>
          )}
        </div>
      )}

      {isMine && (
        <div className="flex flex-col items-end max-w-xs">
          <div className={`${bubbleColor} p-2 rounded-lg relative pr-6`}>
            {message.content}
            <span className="absolute bottom-1 right-1 text-xs text-white">
              {wasRead ? (
                <FaCheckDouble className="text-blue-400" />
              ) : wasDelivered ? (
                <FaCheck />
              ) : null}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageItem;
