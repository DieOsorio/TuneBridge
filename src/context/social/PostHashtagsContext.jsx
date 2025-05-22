import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchPostHashtagsQuery,
  useUpsertPostHashtagMutation,
  useDeletePostHashtagMutation,
} from "./postHashtagsActions";

const PostHashtagsContext = createContext();
PostHashtagsContext.displayName = "PostHashtagsContext";

export const PostHashtagsProvider = ({ children }) => {
  const upsertPostHashtag = useUpsertPostHashtagMutation().mutateAsync;
  const deletePostHashtags = useDeletePostHashtagMutation().mutateAsync;

  const value = {
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

PostHashtagsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  postId: PropTypes.number.isRequired,
};

export const usePostHashtags = () => {
  const context = useContext(PostHashtagsContext);
  if (!context) {
    throw new Error("usePostHashtags must be used within a PostHashtagsProvider");
  }
  return context;
};
