import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MatchCardSkeleton = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div
      className="
        max-w-100 w-full mx-auto border border-gray-400 rounded-xl p-4 
        shadow-sm bg-gray-950 
        hover:shadow-md 
        transition-all duration-150 ease-in-out 
        will-change-transform
        relative
      "
    >
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-6">
        {/* Avatar skeleton */}
        <Skeleton
          circle
          height={52}
          width={52}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />

        {/* Name + username */}
        <div className="flex flex-col gap-1">
          <Skeleton
            height={18}
            width={120}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            height={14}
            width={80}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>      

      {/* Chat button (top right) */}
      <div className="absolute top-4 right-4">
        <Skeleton
          circle
          height={35}
          width={35}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
      
      <div className="flex justify-between items-center ">
          {/* Match badge */}
        <div>
          <Skeleton
            height={30}
            width={100}
            baseColor={baseColor}
            highlightColor={highlightColor}
            borderRadius={15}
          />
        </div>

        {/* Connect button (bottom right) */}
        <div>
          <Skeleton
            height={25}
            width={120}
            baseColor={baseColor}
            highlightColor={highlightColor}
            borderRadius={6}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchCardSkeleton;
