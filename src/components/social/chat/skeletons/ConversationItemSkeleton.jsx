import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ConversationItemSkeleton({ isSelected = false }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 ${
        isSelected ? "bg-sky-700" : "bg-transparent"
      }`}
    >
      {/* avatar */}
      <Skeleton circle width={40} height={40} />

      {/* text */}
      <div className="flex flex-col grow">
        <Skeleton height={14} width="55%" />
        <Skeleton height={12} width="80%" style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}
