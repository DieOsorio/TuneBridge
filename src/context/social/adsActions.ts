import { useQuery, InfiniteData, useMutation, useQueryClient, useInfiniteQuery, UseQueryResult, UseMutationResult, UseInfiniteQueryResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";
import { musicianAdKeyFactory } from "../helpers/social/socialKeys";

export interface MusicianAd {
  id: string;
  profile_id: string;
  group_id?: string;
  ad_type: "looking" | "offering";
  genres: string[] | null;
  looking_for: string[] | null;
  location: string | null;
  description: string;
  created_at: string;
  [key: string]: any;
}

export const useSearchMusicianAdsQuery = (searchTerm: string): UseQueryResult<MusicianAd[], Error> =>
  useQuery<MusicianAd[], Error>({
    queryKey: musicianAdKeyFactory({ searchTerm }).search ?? ["searchMusicianAds", searchTerm ?? ""],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .textSearch("content_search", searchTerm, { type: "websearch" });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!searchTerm,
    select: (data) => (Array.isArray(data) ? data : []),
  });

export const useFetchMusicianAdsQuery = (): UseQueryResult<MusicianAd[], Error> =>
  useQuery<MusicianAd[], Error>({
    queryKey: musicianAdKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

export const useFetchMusicianAdQuery = (adId: string): UseQueryResult<MusicianAd, Error> =>
  useQuery<MusicianAd, Error>({
    queryKey: musicianAdKeyFactory({ adId }).single ?? ["musicianAd", adId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("id", adId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!adId,
  });

export const useFetchUserMusicianAdsQuery = (profileId: string): UseQueryResult<MusicianAd[], Error> =>
  useQuery<MusicianAd[], Error>({
    queryKey: musicianAdKeyFactory({ profileId }).user ?? ["userMusicianAds", profileId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!profileId,
  });

const PAGE_SIZE = 8;
export const useInfiniteUserMusicianAdsQuery = (profileId: string): UseInfiniteQueryResult<InfiniteData<MusicianAd[], unknown>, Error> =>
  useInfiniteQuery<MusicianAd[], Error>({
    queryKey: musicianAdKeyFactory({ profileId }).user ?? ["userMusicianAds", profileId ?? ""],
    queryFn: async ({ pageParam = 0 }) => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(
          (typeof pageParam === "number" ? pageParam : 0) * PAGE_SIZE,
          ((typeof pageParam === "number" ? pageParam : 0) + 1) * PAGE_SIZE - 1
        );
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length === PAGE_SIZE
        ? allPages.length
        : undefined,
    enabled: !!profileId,
    initialPageParam: 0,
  });

export const useFetchGroupMusicianAdsQuery = (groupId: string): UseQueryResult<MusicianAd[], Error> =>
  useQuery<MusicianAd[], Error>({
    queryKey: musicianAdKeyFactory({ groupId }).group ?? ["groupMusicianAds", groupId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!groupId,
  });

export const useCreateMusicianAdMutation = (): UseMutationResult<MusicianAd, Error, Partial<MusicianAd>> => {
  const queryClient = useQueryClient();
  return useMutation<MusicianAd, Error, Partial<MusicianAd>>({
    mutationFn: async (ad) => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .insert(ad)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (ad) => {
      const optimisticAd: MusicianAd = {
        id: ad.id || `temp-${Date.now()}`,
        ...ad,
        created_at: new Date().toISOString(),
      } as MusicianAd;
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: optimisticAd,
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSuccess: (newAd, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: variables as MusicianAd,
        newEntity: newAd,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: variables as MusicianAd,
      });
    },
  });
};

export const useUpdateMusicianAdMutation = (): UseMutationResult<MusicianAd, Error, { ad: MusicianAd; updates: Partial<MusicianAd> }> => {
  const queryClient = useQueryClient();
  return useMutation<MusicianAd, Error, { ad: MusicianAd; updates: Partial<MusicianAd> }>({
    mutationFn: async ({ ad, updates }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .update(updates)
        .eq("id", ad.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async ({ ad, updates }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: { ...ad, ...updates },
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSuccess: (newAd, { ad }) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: ad,
        newEntity: newAd,
      });
    },
    onSettled: (_data, _error, { ad }) => {
      invalidateKeys({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: ad,
      });
    },
  });
};

export const useDeleteMusicianAdMutation = (): UseMutationResult<void, Error, MusicianAd> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, MusicianAd>({
    mutationFn: async (ad) => {
      const { error } = await supabase
        .schema("social")
        .from("musician_ads")
        .delete()
        .eq("id", ad.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (ad) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: ad,
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, ad) => {
      invalidateKeys({
        queryClient,
        keyFactory: (entity: MusicianAd) => musicianAdKeyFactory({ adId: entity.id }).single ?? ["musicianAd", entity.id ?? ""],
        entity: ad,
      });
    },
  });
};
