import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ListSkeleton = ({ count = 5 }: { count?: number }) => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <ul className="divide-y divide-gray-700 max-h-[400px] overflow-y-auto">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex justify-between items-center p-3 bg-zinc-700/20 rounded"
        >
          <div className="flex-1">
            {/* Role name */}
            <Skeleton
              height={20}
              width="40%"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            {/* Permissions */}
            <Skeleton
              height={16}
              width="60%"
              baseColor={baseColor}
              highlightColor={highlightColor}
              style={{ marginTop: 6 }}
            />
          </div>

          {/* Action buttons (edit + delete) */}
          <div className="flex space-x-2">
            <Skeleton
              circle
              height={24}
              width={24}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <Skeleton
              circle
              height={24}
              width={24}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ListSkeleton;
