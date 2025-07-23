import { IoPeople } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const GroupCardSkeleton: React.FC = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="flex flex-col w-64 aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b to-zinc-900 shadow-lg border border-zinc-800 p-0">
      <Skeleton 
        height={144} 
        width="100%" 
        baseColor={baseColor}
        highlightColor={highlightColor}
      />

      <div className="flex flex-col flex-grow px-4 py-3 text-center text-gray-400 gap-1">
        <Skeleton 
          height={20} 
          width="60%" 
          className="mx-auto"
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />
        <Skeleton 
          height={16} 
          width="40%" 
          className="mx-auto"
          baseColor={baseColor}
          highlightColor={highlightColor} 
        />

        <div className="flex justify-center items-center gap-2 text-xs !text-gray-400">
          <IoPeople className="text-amber-500" />
          <Skeleton 
            height={12} 
            width={50}
            baseColor={baseColor}
            highlightColor={highlightColor} 
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              height={20}
              width={50}
              borderRadius={9999}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          ))}
        </div>

        <div className="mt-auto">
          <Skeleton
            height={25}
            width={200}
            borderRadius={9999}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>
    </div>
  );
}

export default GroupCardSkeleton;
