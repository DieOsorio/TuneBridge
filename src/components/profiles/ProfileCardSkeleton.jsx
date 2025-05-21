// components/profile/ProfileCardSkeleton.jsx
import React from "react";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";

const ProfileCardSkeleton = () => {
  return (
    <Box
      sx={{
        width: 240, // aprox 60 * 4 px per unit
        height: 360, // aprox 90 * 4 px per unit
        borderRadius: 2,
        boxShadow: 1,
        backgroundColor: "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        p: 1,
      }}
    >
      {/* Avatar */}
      <Skeleton variant="rectangular" width={240} height={200} sx={{ borderRadius: 1 }} />

      {/* Username */}
      <Skeleton variant="text" width="60%" height={32} />

      {/* Location */}
      <Skeleton variant="text" width="40%" height={24} />

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Button */}
      <Skeleton variant="rectangular" width={160} height={40} sx={{ borderRadius: 1 }} />
    </Box>
  );
};

export default ProfileCardSkeleton;
