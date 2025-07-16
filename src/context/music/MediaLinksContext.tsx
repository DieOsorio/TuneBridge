import { createContext, useContext, ReactNode } from "react";
import {
  useUserMediaLinksQuery,
  useMediaLink,
  useInsertMediaLinkMutation,
  useUpdateMediaLinkMutation,
  useDeleteMediaLinkMutation,
} from "./mediaLinksActions";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { MediaLink, AddMediaLinkParams, UpdateMediaLinkParams, DeleteMediaLinkParams } from "./mediaLinksActions";

export interface MediaLinksContextValue {
  userMediaLinks: typeof useUserMediaLinksQuery;
  getMediaLink: typeof useMediaLink;
  insertMediaLink: (params: AddMediaLinkParams) => Promise<MediaLink | null>;
  updateMediaLink: (params: UpdateMediaLinkParams) => Promise<MediaLink | null>;
  deleteMediaLink: (params: DeleteMediaLinkParams) => Promise<void>;
}

const MediaLinksContext = createContext<MediaLinksContextValue | null>(null);
MediaLinksContext.displayName = "MediaLinksContext";

export const MediaLinksProvider = ({ children }: { children: ReactNode }) => {
  const insertMediaLink = useInsertMediaLinkMutation().mutateAsync;
  const updateMediaLink = useUpdateMediaLinkMutation().mutateAsync;
  const deleteMediaLink = useDeleteMediaLinkMutation().mutateAsync;

  const value: MediaLinksContextValue = {
    userMediaLinks: useUserMediaLinksQuery,
    getMediaLink: useMediaLink,
    insertMediaLink,
    updateMediaLink,
    deleteMediaLink,
  };

  return <MediaLinksContext.Provider value={value}>{children}</MediaLinksContext.Provider>;
};

export const useMediaLinks = (): MediaLinksContextValue => {
  const context = useContext(MediaLinksContext);
  if (!context) {
    throw new Error("useMediaLinks must be used within a MediaLinksProvider");
  }
  return context;
};
