import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AdCardSkeleton from "./AdCardSkeleton";

interface AdsListSkeletonProps {
  isProfileView?: boolean;
}

/**
 * Skeleton loader for AdsList.
 * Optionally shows a header skeleton when in profile view.
 */
const AdsListSkeleton = ({ isProfileView = false }: AdsListSkeletonProps) => {
  return (
    <div className="w-full flex flex-col items-center">
      {isProfileView && (
        <Skeleton
          width={200}
          height={32}
          baseColor="#a1a1aa"
          highlightColor="#e4e4e7"
          className="mb-8"
        />
      )}
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 w-full">
        {[...Array(3)].map((_, i) => (
          <AdCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default AdsListSkeleton;
