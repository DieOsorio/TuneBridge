import React, { createContext, useContext, useState } from "react";

const ProfileIdContext = createContext(null);
ProfileIdContext.displayName = "ProfileIdContext";

export const ProfileIdProvider = ({ children }) => {
  const [profileId, setProfileId] = useState(null);

  return (
    <ProfileIdContext.Provider value={{ profileId, setProfileId }}>
      {children}
    </ProfileIdContext.Provider>
  );
};

export const useProfileId = () => {
  const context = useContext(ProfileIdContext);
  if (!context) {
    throw new Error("useProfileId must be used within a ProfileIdProvider");
  }
  return context;
};