import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  useFetchPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "./postsActions";

const PostsContext = createContext();
PostsContext.displayName = "PostsContext";

export const PostsProvider = ({ children }) => {
  const { data, isLoading, error, refetch } = useFetchPostsQuery();
  const createPost = useCreatePostMutation();
  const updatePost = useUpdatePostMutation();
  const deletePost = useDeletePostMutation();

  const value = {
    posts: data,
    loading: isLoading,
    error,
    refetch,
    createPost: createPost.mutateAsync,
    updatePost: updatePost.mutateAsync,
    deletePost: deletePost.mutateAsync,    
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