import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ConnectionCardSkeleton() {
  return (
    <div className="relative flex flex-col w-35 h-65 bg-gray-100 rounded-lg shadow-sm overflow-hidden">
      {/* avatar / header */}
      <Skeleton height={160} width="100%" />

      {/* action buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <Skeleton circle width={24} height={24} />
        <Skeleton circle width={24} height={24} />
      </div>

      {/* username and location */}
      <div className="flex flex-col gap-1 p-2 grow justify-end">
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="50%" />
      </div>
    </div>
  );
}
