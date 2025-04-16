import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchCommentsQuery,
  useInsertCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation
} from "./commentsActions";

const CommentsContext = createContext();
CommentsContext.displayName = "CommentsContext";

export const CommentsProvider = ({children}) => {
  const useInsertComment = useInsertCommentMutation();
  const useUpdateComment = useUpdateCommentMutation();
  const useDeleteComment = useDeleteCommentMutation();

  const value = {
    useFetchComments: useFetchCommentsQuery,
    useInsertComment: useInsertComment.mutateAsync,
    useUpdateComment: useUpdateComment.mutateAsync,
    useDeleteComment: useDeleteComment.mutateAsync,
  };

  return(
    <CommentsContext.Provider
    value={value}>
      {children}
    </CommentsContext.Provider>  
  )
};

CommentsProvider.PropTypes = {
  children: PropTypes.node.isRequired,
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useLies must be used within a CommentsProvider")
  }
  return context;
};