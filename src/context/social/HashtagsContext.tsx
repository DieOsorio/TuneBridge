import { createContext, useContext, ReactNode, FC } from "react";
import {
  useFetchHashtagsQuery,
  useUpsertHashtagMutation,
  useDeleteHashtagMutation,
} from "./hashtagsActions";
import type { Hashtag } from "./hashtagsActions";
import { UseQueryResult } from "@tanstack/react-query";

export interface HashtagsContextValue {
  hashtags: Hashtag[] | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  upsertHashtag: (hashtag: Partial<Hashtag>) => Promise<Hashtag>;
  deleteHashtag: (hashtag: Hashtag) => Promise<void>;
}

const HashtagsContext = createContext<HashtagsContextValue | undefined>(undefined);
HashtagsContext.displayName = "HashtagsContext";

export interface HashtagsProviderProps {
  children: ReactNode;
}

export const HashtagsProvider: FC<HashtagsProviderProps> = ({ children }) => {
  const { data: hashtags, isLoading: loading, error, refetch } = useFetchHashtagsQuery();
  const upsertHashtag = useUpsertHashtagMutation().mutateAsync;
  const deleteHashtag = useDeleteHashtagMutation().mutateAsync;

  const value: HashtagsContextValue = {
    hashtags,
    loading,
    error,
    refetch,
    upsertHashtag,
    deleteHashtag,
  };

  return (
    <HashtagsContext.Provider value={value}>
      {children}
    </HashtagsContext.Provider>
  );
};

export const useHashtags = (): HashtagsContextValue => {
  const context = useContext(HashtagsContext);
  if (!context) {
    throw new Error("useHashtags must be used within a HashtagsProvider");
  }
  return context;
};
