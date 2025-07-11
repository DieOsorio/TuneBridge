import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ConnectionCardSkeleton() {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="relative flex flex-col w-35 h-65 bg-gray-100 rounded-lg shadow-sm overflow-hidden">
      {/* avatar / header */}
      <Skeleton 
        height={160} 
        width="100%"
        baseColor={baseColor}
        highlightColor={highlightColor} 
      />

      {/* action buttons */}
      <div className="absolute top-2 right-2 flex flex-col items-center">
        <Skeleton 
          circle 
          width={5} 
          height={5}
          baseColor="#71717a"
          highlightColor={highlightColor} 
        />
        <Skeleton 
          circle 
          width={5} 
          height={5}
          className="-top-4"
          baseColor="#71717a"
          highlightColor={highlightColor}
        />
        <Skeleton 
          circle 
          width={5} 
          height={5}
          className="-top-8"
          baseColor="#71717a"
          highlightColor={highlightColor} 
        />
      </div>

      {/* username and location */}
      <div className="flex flex-col justify-center items-center gap-1 p-2 grow">
        <Skeleton 
          height={18} 
          width={120}
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
        <Skeleton 
          height={14} 
          width={90}
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
      </div>
    </div>
  );
}
