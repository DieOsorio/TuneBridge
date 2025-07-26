import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function PostCardSkeleton() {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="bg-gradient-to-l to-gray-800 p-4 rounded-lg shadow-md mb-4 mx-auto max-w-3xl w-full">
      {/* Title */}
      <Skeleton
        height={60}
        baseColor={baseColor}
        highlightColor={highlightColor}
        className="mb-4 rounded-lg"
      />

      {/* Main layout: responsive */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Sidebar */}
        <div className="flex sm:flex-col flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Avatar + username */}
          <div className="flex flex-col items-center gap-2 sm:mb-auto">
            <Skeleton
              width={80}
              height={14}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
            <Skeleton
              circle
              width={60}
              height={60}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>

          {/* Buttons */}
          <div className="flex sm:flex-col items-center justify-center gap-4 sm:gap-6 ml-auto sm:ml-5 sm:mt-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                circle
                width={40}
                height={40}
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            ))}
          </div>
        </div>

        {/* Images section */}
        <div className="w-full max-w-[600px] mx-auto p-4 bg-gradient-to-l from-gray-900 rounded-md">
          <Skeleton
            height={300}
            className="w-full rounded-md"
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>

      {/* Hashtags (approximation) */}
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            width={80}
            height={20}
            baseColor={baseColor}
            highlightColor={highlightColor}
            className="rounded"
          />
        ))}
      </div>

      {/* Text content */}
      <div className="max-w-[600px] mx-auto">
        <Skeleton
          height={80}
          className="rounded-md mt-6"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
    </div>
  );
}

/*
  PostCardSkeleton.tsx

  Skeleton loading component for PostCard with react-loading-skeleton.

  No props required.

  Renders placeholder skeletons for title, avatar, buttons, images, hashtags, and text content.
*/
