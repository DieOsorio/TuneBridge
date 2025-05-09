import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
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

const PostsContext = createContext();
PostsContext.displayName = "PostsContext";

export const PostsProvider = ({ children }) => {
  const { data: posts, isLoading: loading, error, refetch } = useFetchPostsQuery();
  const createPost = useCreatePostMutation().mutateAsync;
  const updatePost = useUpdatePostMutation().mutateAsync;
  const deletePost = useDeletePostMutation().mutateAsync;
  
  const value = {
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
  }

  return (
    <PostsContext.Provider
      value={value}
    >
      {children}
    </PostsContext.Provider>
  );
};

PostsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};