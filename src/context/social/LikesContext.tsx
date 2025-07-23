import { createContext, useContext, ReactNode } from "react";
import {
  useFetchLikesQuery,
  useUserLikesQuery,
  useInsertLikeMutation,
  useDeleteLikeMutation,
  useCommentLikesQuery,
  usePostLikesQuery,
  useUserLikedPostQuery
} from "./likesActions";
import type { Like } from "./likesActions";

export interface LikesContextValue {
  likes: Like[] | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  userLikes: typeof useUserLikesQuery;
  insertLike: (like: Partial<Like>) => Promise<Like>;
  deleteLike: (like: Like) => Promise<void>;
  commentLikesQuery: typeof useCommentLikesQuery;
  postLikesQuery: typeof usePostLikesQuery;
  userLikedPostQuery: typeof useUserLikedPostQuery;
}

const LikesContext = createContext<LikesContextValue | undefined>(undefined);
LikesContext.displayName = "LikesContext";

export interface LikesProviderProps {
  children: ReactNode;
}

export const LikesProvider = ({ children }: { children: ReactNode }) => {
  const { data: likes, isLoading: loading, error, refetch } = useFetchLikesQuery();
  const insertLike = useInsertLikeMutation().mutateAsync;
  const deleteLike = useDeleteLikeMutation().mutateAsync;

  const value: LikesContextValue = {
    likes,
    loading,
    error,
    refetch,
    userLikes: useUserLikesQuery,
    insertLike,
    deleteLike,
    commentLikesQuery: useCommentLikesQuery,
    postLikesQuery: usePostLikesQuery,
    userLikedPostQuery: useUserLikedPostQuery,
  };

  return (
    <LikesContext.Provider value={value}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = (): LikesContextValue => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLikes must be used within a LikesProvider");
  }
  return context;
};
