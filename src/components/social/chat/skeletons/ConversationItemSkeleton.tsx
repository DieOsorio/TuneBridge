import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface ConversationItemSkeletonProps {
  isSelected?: boolean;
}

/**
 * Skeleton loader for a conversation item.
 * Highlights the background if the item is selected.
 */
const ConversationItemSkeleton = ({
  isSelected = false,
}: ConversationItemSkeletonProps) => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 ${
        isSelected ? "bg-sky-700" : "bg-transparent"
      }`}
    >
      {/* Avatar skeleton */}
      <Skeleton
        circle
        width={40}
        height={40}
        baseColor={baseColor}
        highlightColor={highlightColor}
      />

      {/* Text skeleton */}
      <div className="flex flex-col grow">
        <Skeleton
          height={15}
          width="80%"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
    </div>
  );
};

export default ConversationItemSkeleton;
