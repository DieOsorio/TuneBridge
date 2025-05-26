import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchHashtagsQuery,
  useUpsertHashtagMutation,
  useDeleteHashtagMutation,
} from "./hashtagsActions";

const HashtagsContext = createContext();
HashtagsContext.displayName = "HashtagsContext";

export const HashtagsProvider = ({ children }) => {
  const { data: hashtags, isLoading: loading, error, refetch } = useFetchHashtagsQuery();
  const upsertHashtag = useUpsertHashtagMutation().mutateAsync;
  const deleteHashtag = useDeleteHashtagMutation().mutateAsync;

  const value = {
    hashtags,
    loading,
    error,
    refetch,
    upsertHashtag,
    deleteHashtag,
  };

  return (
    <HashtagsContext.Provider value={value}>
      {children}
    </HashtagsContext.Provider>
  );
};

HashtagsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useHashtags = () => {
  const context = useContext(HashtagsContext);
  if (!context) {
    throw new Error("useHashtags must be used within a HashtagsProvider");
  }
  return context;
};
