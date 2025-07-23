import { createContext, useContext, ReactNode } from "react";
import {
  useFetchPostHashtagsQuery,
  useUpsertPostHashtagMutation,
  useDeletePostHashtagMutation,
} from "./postHashtagsActions";

export interface PostHashtagsContextValue {
  getHashtagsByPostId: typeof useFetchPostHashtagsQuery;
  upsertPostHashtag: ReturnType<typeof useUpsertPostHashtagMutation>["mutateAsync"];
  deletePostHashtags: ReturnType<typeof useDeletePostHashtagMutation>["mutateAsync"];
}

const PostHashtagsContext = createContext<PostHashtagsContextValue | undefined>(undefined);
PostHashtagsContext.displayName = "PostHashtagsContext";

export interface PostHashtagsProviderProps {
  children: ReactNode;
}

export const PostHashtagsProvider = ({ children }: { children: ReactNode }) => {
  const upsertPostHashtag = useUpsertPostHashtagMutation().mutateAsync;
  const deletePostHashtags = useDeletePostHashtagMutation().mutateAsync;

  const value: PostHashtagsContextValue = {
    getHashtagsByPostId: useFetchPostHashtagsQuery,
    upsertPostHashtag,
    deletePostHashtags,
  };

  return (
    <PostHashtagsContext.Provider value={value}>
      {children}
    </PostHashtagsContext.Provider>
  );
};

export const usePostHashtags = (): PostHashtagsContextValue => {
  const context = useContext(PostHashtagsContext);
  if (!context) {
    throw new Error("usePostHashtags must be used within a PostHashtagsProvider");
  }
  return context;
};
