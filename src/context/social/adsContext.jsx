import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchMusicianAdsQuery,
  useFetchMusicianAdQuery,
  useFetchUserMusicianAdsQuery,
  useFetchGroupMusicianAdsQuery,
  useCreateMusicianAdMutation,
  useUpdateMusicianAdMutation,
  useDeleteMusicianAdMutation,
  useInfiniteUserMusicianAdsQuery,
  useSearchMusicianAdsQuery
} from "./adsActions";

const AdsContext = createContext();
AdsContext.displayName = "AdsContext";

export const AdsProvider = ({ children }) => {
  const createAd = useCreateMusicianAdMutation().mutateAsync;
  const updateAd = useUpdateMusicianAdMutation().mutateAsync;
  const deleteAd = useDeleteMusicianAdMutation().mutateAsync;

  const value = {
    fetchAllAds: useFetchMusicianAdsQuery,
    fetchAd: useFetchMusicianAdQuery,
    fetchUserAds: useFetchUserMusicianAdsQuery,
    fetchGroupAds: useFetchGroupMusicianAdsQuery,
    fetchInfiniteByUser: useInfiniteUserMusicianAdsQuery,
    searchMusicianAds: useSearchMusicianAdsQuery,
    createAd,
    updateAd,
    deleteAd,
  };

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
};

AdsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAds = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error("useAds must be used within an AdsProvider");
  }
  return context;
};
