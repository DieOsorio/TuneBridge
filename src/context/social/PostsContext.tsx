import React, { createContext, useContext, ReactNode, useMemo } from "react";
import {
  useFetchPostsQuery,
  useUserPostsQuery,
  useFetchPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSearchPostsQuery,
  useInfinitePostsQuery,
  useInfiniteUserPostsQuery,
} from "./postsActions";
import { UseQueryResult, UseMutationResult, UseInfiniteQueryResult } from "@tanstack/react-query";
import { Post } from "./postsActions";

export interface PostsContextValue {
  posts: Post[] | undefined;
  loading: boolean;
  error: unknown;
  refetch: (() => void) | undefined;
  createPost: ReturnType<typeof useCreatePostMutation>["mutateAsync"];
  updatePost: ReturnType<typeof useUpdatePostMutation>["mutateAsync"];
  deletePost: ReturnType<typeof useDeletePostMutation>["mutateAsync"];
  userPosts: typeof useUserPostsQuery;
  fetchPost: typeof useFetchPostQuery;
  searchPosts: typeof useSearchPostsQuery;
  infinitePosts: typeof useInfinitePostsQuery;
  infiniteUserPosts: typeof useInfiniteUserPostsQuery;
}

const PostsContext = createContext<PostsContextValue | undefined>(undefined);
PostsContext.displayName = "PostsContext";

export interface PostsProviderProps {
  children: ReactNode;
}

export const PostsProvider: React.FC<PostsProviderProps> = ({ children }) => {
  const { data: posts, isLoading: loading, error, refetch } = useFetchPostsQuery();
  const createPost = useCreatePostMutation().mutateAsync;
  const updatePost = useUpdatePostMutation().mutateAsync;
  const deletePost = useDeletePostMutation().mutateAsync;

  const value = useMemo<PostsContextValue>(() => ({
    posts,
    loading,
    error,
    refetch,
    createPost,
    updatePost,
    deletePost,
    userPosts: useUserPostsQuery,
    fetchPost: useFetchPostQuery,
    searchPosts: useSearchPostsQuery,
    infinitePosts: useInfinitePostsQuery,
    infiniteUserPosts: useInfiniteUserPostsQuery,
  }), [posts, loading, error, refetch, createPost, updatePost, deletePost]);

  return (
    <PostsContext.Provider value={value}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextValue => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
