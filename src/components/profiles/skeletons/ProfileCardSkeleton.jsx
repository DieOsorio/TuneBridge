import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileCardSkeleton = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";
  return (
    <div className="flex flex-col w-60 h-90 items-center gap-2 rounded-lg shadow-sm bg-gray-200">
      {/* Avatar placeholder */}
      <Skeleton 
        height={200} 
        width={240} 
        baseColor={baseColor}
        highlightColor={highlightColor}
      />

      {/* Username */}
      <div className="text-center w-full px-4">
        <Skeleton 
          height={20} 
          width={`70%`} 
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
        <Skeleton 
          height={16} 
          width={`50%`} 
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
      </div>

      {/* Button placeholder */}
      <div className="mt-auto py-4 w-full flex justify-center">
        <Skeleton 
          height={40} 
          width={200} 
          borderRadius={8}
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
