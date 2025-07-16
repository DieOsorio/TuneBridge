import { createContext, useContext, ReactNode, FC } from "react";
import {
  useFetchLikesQuery,
  useUserLikesQuery,
  useInsertLikeMutation,
  useUpdateLikeMutation,
  useDeleteLikeMutation,
  useCommentLikesQuery,
  usePostLikesQuery,
  useUserLikedPostQuery
} from "./likesActions";
import type { Like } from "./likesActions";
import { UseQueryResult } from "@tanstack/react-query";

export interface LikesContextValue {
  likes: Like[] | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
  userLikes: typeof useUserLikesQuery;
  insertLike: (like: Partial<Like>) => Promise<Like>;
  updateLike: (params: { id: string; updatedLike: Partial<Like> }) => Promise<Like>;
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

export const LikesProvider: FC<LikesProviderProps> = ({ children }) => {
  const { data: likes, isLoading: loading, error, refetch } = useFetchLikesQuery();
  const insertLike = useInsertLikeMutation().mutateAsync;
  const updateLike = useUpdateLikeMutation().mutateAsync;
  const deleteLike = useDeleteLikeMutation().mutateAsync;

  const value: LikesContextValue = {
    likes,
    loading,
    error,
    refetch,
    userLikes: useUserLikesQuery,
    insertLike,
    updateLike,
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
