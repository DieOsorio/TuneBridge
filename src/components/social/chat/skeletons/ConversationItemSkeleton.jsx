import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ConversationItemSkeleton({ isSelected = false }) {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 ${
        isSelected ? "bg-sky-700" : "bg-transparent"
      }`}
    >
      {/* avatar */}
      <Skeleton 
        circle width={40} 
        height={40}
        baseColor={baseColor}
        highlightColor={highlightColor}  
      />

      {/* text */}
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
}
