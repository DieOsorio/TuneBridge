import { Skeleton, Box } from '@mui/material';

function PostCardSkeleton() {
  return (
    <Box className="bg-gradient-to-l to-gray-800 p-4 rounded-lg shadow-md mb-4 mx-auto max-w-3xl w-full">
      {/* Title */}
      <Skeleton variant="rectangular" height={40} className="mb-4 rounded-lg" />

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Sidebar (avatar + buttons) */}
        <div className="flex sm:flex-col flex-row items-center gap-4">
          <Box className="flex flex-col items-center gap-2">
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="text" width={80} />
          </Box>

          <div className="flex sm:flex-col items-center justify-end gap-6 mt-4 ml-auto sm:ml-0">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </div>
        </div>

        {/* Images section */}
        <Box className="w-full max-w-[600px] mx-auto p-4 bg-gradient-to-l from-gray-900 rounded-md">
          <Skeleton variant="rectangular" height={300} className="w-full rounded-md" />
        </Box>
      </div>

      {/* Text content */}
      <Skeleton variant="rectangular" height={80} className="rounded-md mt-6" />
    </Box>
  );
}

export default PostCardSkeleton;
