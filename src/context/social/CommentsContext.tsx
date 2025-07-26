import { createContext, useContext, ReactNode } from "react";
import {
  useFetchCommentsQuery,
  useInsertCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation
} from "./commentsActions";
import type { Comment } from "./commentsActions";

export interface CommentsContextValue {
  fetchComments: typeof useFetchCommentsQuery;
  insertComment: (comment: Partial<Comment>) => Promise<Comment>;
  updateComment: (params: { id: string; updatedComment: Partial<Comment>; post_id: string }) => Promise<Comment>;
  deleteComment: (comment: Comment) => Promise<void>;
}

const CommentsContext = createContext<CommentsContextValue | undefined>(undefined);
CommentsContext.displayName = "CommentsContext";

export const CommentsProvider = ({ children }: { children: ReactNode }) => {
  const insertComment = useInsertCommentMutation().mutateAsync;
  const updateComment = useUpdateCommentMutation().mutateAsync;
  const deleteComment = useDeleteCommentMutation().mutateAsync;

  const value: CommentsContextValue = {
    fetchComments: useFetchCommentsQuery,
    insertComment,
    updateComment,
    deleteComment,
  };

  return (
    <CommentsContext.Provider value={value}>
      {children}
    </CommentsContext.Provider>
  );
};

export const useComments = (): CommentsContextValue => {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
};
