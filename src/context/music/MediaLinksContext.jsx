import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useUserMediaLinksQuery,
  useInsertMediaLinkMutation,
  useUpdateMediaLinkMutation,
  useDeleteMediaLinkMutation,
} from "./mediaLinksActions";
const MediaLinksContext = createContext(null);
MediaLinksContext.displayName = "MediaLinksContext";

export const MediaLinksProvider = ({ children }) => {

  const insertMediaLink = useInsertMediaLinkMutation().mutateAsync;
  const updateMediaLink = useUpdateMediaLinkMutation().mutateAsync;
  const deleteMediaLink = useDeleteMediaLinkMutation().mutateAsync;

  const value ={
      userMediaLinks: useUserMediaLinksQuery,
      insertMediaLink,
      updateMediaLink,
      deleteMediaLink,
  }

  return <MediaLinksContext.Provider value={value}>{children}</MediaLinksContext.Provider>;
};

MediaLinksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMediaLinks = () => {
  const context = useContext(MediaLinksContext);
  if (!context) {
    throw new Error("useMediaLinks must be used within a MediaLinksProvider");
  }
  return context;
};