import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import React from "react";

const DisplayRoleInfoSkeleton: React.FC = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <div className="mt-6">
      {/* Title */}
      <div className="text-center mb-4">
        <Skeleton
          width={220}
          height={28}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      {/* Skeleton cards (3 items per role) */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <li
            key={i}
            className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-sm"
          >
            {[...Array(3)].map((_, j) => (
              <div key={j} className="mb-2">
                <Skeleton
                  height={14}
                  baseColor={baseColor}
                  highlightColor={highlightColor}
                  width={`${80 + Math.random() * 20}%`}
                />
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DisplayRoleInfoSkeleton;
