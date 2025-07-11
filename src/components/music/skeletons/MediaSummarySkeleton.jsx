import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function MediaSummarySkeleton() {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="flex flex-col gap-6">
          <Skeleton 
            height={50} 
            className="rounded-lg"
            baseColor={baseColor}
            highlightColor={highlightColor} 
          />
          <Skeleton 
            height={300} 
            className="rounded-lg"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />        
      </div>
  )
}

export default MediaSummarySkeleton