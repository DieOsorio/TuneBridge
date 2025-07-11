import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const AdCardSkeleton = () => {
  const baseColor = "#4b5563"; // Tailwind gray-700
  const highlightColor = "#9ca3af"; // Tailwind gray-400

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5 shadow-sm space-y-4 min-w-[300px] sm:min-w-[400px] max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton
          width={150}
          height={20}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          width={70}
          height={24}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      {/* Info */}
      <div className="space-y-2">
        <Skeleton width="90%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton width="80%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
        <Skeleton width="70%" height={14} baseColor={baseColor} highlightColor={highlightColor} />
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton 
            width={20} 
            height={20} 
            baseColor={baseColor} 
            highlightColor={highlightColor} 
          />
          <Skeleton 
            width={20} 
            height={20} 
            baseColor={baseColor} 
            highlightColor={highlightColor} 
          />
        </div>
        <Skeleton 
          width={70} 
          height={20} 
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
      </div>
    </div>
  );
};

export default AdCardSkeleton;
