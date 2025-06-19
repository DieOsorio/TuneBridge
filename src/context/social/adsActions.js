import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";
import { musicianAdKeyFactory } from "../helpers/social/socialKeys";

// FETCH ALL ADS
export const useFetchMusicianAdsQuery = () => {
  return useQuery({
    queryKey: musicianAdKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// FETCH SINGLE AD
export const useFetchMusicianAdQuery = (adId) => {
  return useQuery({
    queryKey: musicianAdKeyFactory({ adId }).single,
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
};

// FETCH ADS BY PROFILE
export const useFetchUserMusicianAdsQuery = (profileId) => {
  return useQuery({
    queryKey: musicianAdKeyFactory({ profileId }).user,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId,
  });
};

// FETCH ADS BY PROFILE USING INFINITE QUERY
const PAGE_SIZE = 8; 

export const useInfiniteUserMusicianAdsQuery = (profileId) => {
  return useInfiniteQuery({
    queryKey: musicianAdKeyFactory({ profileId }).user,
    queryFn: async ({ pageParam = 0 }) => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(
          pageParam * PAGE_SIZE,
          (pageParam + 1) * PAGE_SIZE - 1
        );

      if (error) throw new Error(error.message);
      return data;
    },
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length === PAGE_SIZE
        ? allPages.length
        : undefined,
    enabled: !!profileId,
  });
};


// FETCH ADS BY GROUP
export const useFetchGroupMusicianAdsQuery = (groupId) => {
  return useQuery({
    queryKey: musicianAdKeyFactory({ groupId }).group,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("musician_ads")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!groupId,
  });
};

// CREATE AD
export const useCreateMusicianAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
      const optimisticAd = {
        id: ad.id || `temp-${Date.now()}`,
        ...ad,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: optimisticAd,
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newAd, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: {
          id: variables.id || `temp-${Date.now()}`,
          profileId: variables.profile_id,
          groupId: variables.group_id,
        },
        newEntity: newAd,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: {
          profileId: variables.profile_id,
          groupId: variables.group_id,
        },
      });
    },
  });
};

// UPDATE AD
export const useUpdateMusicianAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
        keyFactory: musicianAdKeyFactory,
        entity: { ...ad, ...updates },
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newAd, { ad }) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: { id: ad.id },
        newEntity: newAd,
      });
    },
    onSettled: (_data, _error, { ad }) => {
      invalidateKeys({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: {
          id: ad.id,
          profileId: ad.profile_id,
          groupId: ad.group_id,
        },
      });
    },
  });
};

// DELETE AD
export const useDeleteMusicianAdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
        keyFactory: musicianAdKeyFactory,
        entity: ad,
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, ad) => {
      invalidateKeys({
        queryClient,
        keyFactory: musicianAdKeyFactory,
        entity: {
          id: ad.id,
          profileId: ad.profile_id,
          groupId: ad.group_id,
        },
      });
    },
  });
};
