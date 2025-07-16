import { createContext, useContext, ReactNode, FC } from "react";
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
import type { MusicianAd } from "./adsActions";

export interface AdsContextValue {
  fetchAllAds: typeof useFetchMusicianAdsQuery;
  fetchAd: typeof useFetchMusicianAdQuery;
  fetchUserAds: typeof useFetchUserMusicianAdsQuery;
  fetchGroupAds: typeof useFetchGroupMusicianAdsQuery;
  fetchInfiniteByUser: typeof useInfiniteUserMusicianAdsQuery;
  searchMusicianAds: typeof useSearchMusicianAdsQuery;
  createAd: (ad: Partial<MusicianAd>) => Promise<MusicianAd>;
  updateAd: (params: { ad: MusicianAd; updates: Partial<MusicianAd> }) => Promise<MusicianAd>;
  deleteAd: (ad: MusicianAd) => Promise<void>;
}

const AdsContext = createContext<AdsContextValue | undefined>(undefined);
AdsContext.displayName = "AdsContext";

export interface AdsProviderProps {
  children: ReactNode;
}

export const AdsProvider: FC<AdsProviderProps> = ({ children }) => {
  const createAd = useCreateMusicianAdMutation().mutateAsync;
  const updateAd = useUpdateMusicianAdMutation().mutateAsync;
  const deleteAd = useDeleteMusicianAdMutation().mutateAsync;

  const value: AdsContextValue = {
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

export const useAds = (): AdsContextValue => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error("useAds must be used within an AdsProvider");
  }
  return context;
};
