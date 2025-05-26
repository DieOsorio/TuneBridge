import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchProfileHashtagsQuery,
  useUpsertProfileHashtagMutation,
  useDeleteProfileHashtagMutation,
} from "./profileHashtagsActions";

const ProfileHashtagsContext = createContext();
ProfileHashtagsContext.displayName = "ProfileHashtagsContext";

export const ProfileHashtagsProvider = ({ children }) => {
  const upsertProfileHashtag = useUpsertProfileHashtagMutation().mutateAsync;
  const deleteProfileHashtag = useDeleteProfileHashtagMutation().mutateAsync;

  const value = {
    getHashtagsByProfileId: useFetchProfileHashtagsQuery,
    upsertProfileHashtag,
    deleteProfileHashtag,
  };

  return (
    <ProfileHashtagsContext.Provider value={value}>
      {children}
    </ProfileHashtagsContext.Provider>
  );
};

ProfileHashtagsProvider.propTypes = {
  children: PropTypes.node.isRequired,
  profileId: PropTypes.number.isRequired,
};

export const useProfileHashtags = () => {
  const context = useContext(ProfileHashtagsContext);
  if (!context) {
    throw new Error("useProfileHashtags must be used within a ProfileHashtagsProvider");
  }
  return context;
};
