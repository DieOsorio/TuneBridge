import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RoleItemSkeleton = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md flex flex-col gap-4 items-center">
      <Skeleton
        height={24}
        width={120}
        baseColor={baseColor}
        highlightColor={highlightColor}
      />
      <ChevronDownIcon className="text-gray-400 mt-2 w-5" />
    </div>
  );
};

export default RoleItemSkeleton;
