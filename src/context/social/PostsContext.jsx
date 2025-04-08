import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  fetchPostsQuery,
  createPostMutation,
  updatePostMutation,
  deletePostMutation,
} from "./postsActions";

const PostsContext = createContext();
PostsContext.displayName = "PostsContext";

export const PostsProvider = ({ children }) => {
  const { data, isLoading, error, refetch } = fetchPostsQuery();
  const createPost = createPostMutation();
  const updatePost = updatePostMutation();
  const deletePost = deletePostMutation();

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