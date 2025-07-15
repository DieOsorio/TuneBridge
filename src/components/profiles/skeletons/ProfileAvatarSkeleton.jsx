import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function ProfileAvatarSkeleton({ className = "", list = false, size = 120 }) {
  const resolvedSize = list ? 40 : size;
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return list ? (
    <Skeleton
      circle
      height={resolvedSize}
      width={resolvedSize}
      className={className}
      containerClassName={className}
      baseColor={baseColor}
      highlightColor={highlightColor}
    />
  ) : (
    <div
      className={`rounded-full shadow-md overflow-hidden ${className}`}
      style={{ width: resolvedSize, height: resolvedSize }}
    >
      <Skeleton 
        circle height="100%" 
        width="100%"
        baseColor={baseColor}
        highlightColor={highlightColor} 
      />
    </div>
  );
}

export default ProfileAvatarSkeleton;
