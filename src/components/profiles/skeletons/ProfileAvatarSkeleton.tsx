import React from "react";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProfileMiniboxSkeleton: React.FC = () => {
  const baseColor = "#a1a1aa";
  const highlightColor = "#e4e4e7";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute z-50 p-4 rounded-lg shadow-md bg-neutral-100 dark:bg-neutral-900 w-64 text-sm"
    >
      {/* Avatar + name + location */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton
          circle
          width={40}
          height={40}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <div className="flex-1 space-y-1">
          <Skeleton
            width={80}
            height={10}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
          <Skeleton
            width={100}
            height={8}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1 mb-3">
        <Skeleton
          height={8}
          width="100%"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={8}
          width="90%"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={8}
          width="80%"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          height={8}
          width="70%"
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>

      {/* Action buttons */}
      <div className="flex justify-end items-center gap-5 pt-2">
        <Skeleton
          width={30}
          height={30}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          width={30}
          height={30}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
        <Skeleton
          width={30}
          height={30}
          baseColor={baseColor}
          highlightColor={highlightColor}
        />
      </div>
    </motion.div>
  );
};

export default ProfileMiniboxSkeleton;
