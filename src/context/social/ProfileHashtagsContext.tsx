import { createContext, useContext, ReactNode } from "react";
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

export const ProfileHashtagsProvider = ({ children }: { children: ReactNode }) => {
  const upsertProfileHashtag = useUpsertProfileHashtagMutation().mutateAsync;
  const deleteProfileHashtag = useDeleteProfileHashtagMutation().mutateAsync;

  const value: ProfileHashtagsContextValue = {
    getHashtagsByProfileId: useFetchProfileHashtagsQuery,
    upsertProfileHashtag,
    deleteProfileHashtag,
  };

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
