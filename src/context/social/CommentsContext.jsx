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
  const insertComment = useInsertCommentMutation().mutateAsync;
  const updateComment = useUpdateCommentMutation().mutateAsync;
  const deleteComment = useDeleteCommentMutation().mutateAsync;

  const value = {
    fetchComments: useFetchCommentsQuery,
    insertComment,
    updateComment,
    deleteComment,
  };

  return(
    <CommentsContext.Provider
    value={value}>
      {children}
    </CommentsContext.Provider>  
  )
};

CommentsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useComments = () => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useLies must be used within a CommentsProvider")
  }
  return context;
};