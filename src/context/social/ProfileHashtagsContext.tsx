import React, { createContext, useContext, ReactNode, useMemo } from "react";
import {
  useFetchProfileHashtagsQuery,
  useUpsertProfileHashtagMutation,
  useDeleteProfileHashtagMutation,
} from "./profileHashtagsActions";

export interface ProfileHashtagsContextValue {
  getHashtagsByProfileId: typeof useFetchProfileHashtagsQuery;
  upsertProfileHashtag: ReturnType<typeof useUpsertProfileHashtagMutation>["mutateAsync"];
  deleteProfileHashtag: ReturnType<typeof useDeleteProfileHashtagMutation>["mutateAsync"];
}

const ProfileHashtagsContext = createContext<ProfileHashtagsContextValue | undefined>(undefined);
ProfileHashtagsContext.displayName = "ProfileHashtagsContext";

export interface ProfileHashtagsProviderProps {
  children: ReactNode;
}

export const ProfileHashtagsProvider: React.FC<ProfileHashtagsProviderProps> = ({ children }) => {
  const upsertProfileHashtag = useUpsertProfileHashtagMutation().mutateAsync;
  const deleteProfileHashtag = useDeleteProfileHashtagMutation().mutateAsync;

  const value = useMemo<ProfileHashtagsContextValue>(() => ({
    getHashtagsByProfileId: useFetchProfileHashtagsQuery,
    upsertProfileHashtag,
    deleteProfileHashtag,
  }), [upsertProfileHashtag, deleteProfileHashtag]);

  return (
    <ProfileHashtagsContext.Provider value={value}>
      {children}
    </ProfileHashtagsContext.Provider>
  );
};

export const useProfileHashtags = (): ProfileHashtagsContextValue => {
  const context = useContext(ProfileHashtagsContext);
  if (!context) {
    throw new Error("useProfileHashtags must be used within a ProfileHashtagsProvider");
  }
  return context;
};
