import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { useMemo } from "react";
import { optimisticUpdate, rollbackCache, replaceOptimisticItem, invalidateKeys } from '../helpers/cacheHandler';
import { profileKeyFactory } from '../helpers/profile/profileKeys';

// INFINITE SCROLL FOR ALL PROFILES
const PAGE_SIZE = 8; // Number of profiles to fetch per page

export const useInfiniteProfilesQuery = () => {
  return useInfiniteQuery({
    queryKey: profileKeyFactory({ infinite: true }).infinite,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
};

// Fetch profiles based on search term
export const useSearchProfilesQuery = (searchTerm) => {
  return useQuery({
    queryKey: profileKeyFactory({ searchTerm }).search,
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .textSearch("content_search_all", searchTerm, { type: "websearch" });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!searchTerm,
    select: data => Array.isArray(data) ? data : [],
  });
};

// Fetch all profiles
export const useAllProfilesQuery = () => {
  return useQuery({
    queryKey: profileKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profiles")
        .select("*");
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// Fetch a single profile
export const useProfileQuery = (identifier) => {
  const isUUID = identifier && identifier.includes("-") && identifier.length === 36;
  const queryKey = isUUID
    ? profileKeyFactory({ id: identifier }).single
    : profileKeyFactory({ username: identifier }).single;
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!identifier) return null;
      const query = supabase
        .schema("users")
        .from("profiles")
        .select("*")
        .eq(isUUID ? "id" : "username", identifier);
      const { data, error } = await query.single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!identifier,
  });
};


// Map through an array of profile IDs and access each one
export const useProfilesMap = (profileIds = []) => {
  const uniqueSortedIds = useMemo(() => [...new Set(profileIds)].sort(), [profileIds]);
  return useQuery({
    queryKey: profileKeyFactory({ profileIds: uniqueSortedIds }).map,
    enabled: uniqueSortedIds.length > 0,
    queryFn: async () => {
      if (!profileIds || profileIds.length === 0) return;
      const { data, error } = await supabase
        .schema("users")
        .from("profiles")
        .select('id, avatar_url, username')
        .in('id', uniqueSortedIds);
      if (error) throw new Error(error.message);
      const map = {};
      data.forEach(profile => {
        map[profile.id] = profile;
      });
      return map;
    },
  });
};

// Prefetch a single profile
export const usePrefetchProfile = () => {
  const queryClient = useQueryClient();
  return async (identifier) => {
    if (!identifier) return;
    const isUUID = identifier.includes("-") && identifier.length === 36;
    const queryKey = isUUID
      ? profileKeyFactory({ id: identifier }).single
      : profileKeyFactory({ username: identifier }).single;
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const query = supabase
          .schema("users")
          .from("profiles")
          .select("*")
          .eq(isUUID ? "id" : "username", identifier);
        const { data, error } = await query.single();
        if (error) throw new Error(error.message);
        return data;
      },
    });
  };
};

// Create a profile
export const useCreateProfile = () => {
  return useMutation({
    mutationFn: async ({ userId, email }) => {
      const { error } = await supabase
        .schema("users")
        .from("profiles")
        .insert([{
          id: userId,
          username: null,
          email,
          avatar_url: "",
          country: "",
          city: "",
          firstname: "",
          lastname: "",
          gender: "",
          birthdate: null,
        }]);
      if (error) throw new Error(error.message);
    },
  });
};

// Update a profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      // Remove fields that should not be updated if needed (e.g., id)
      const { id, ...updateFields } = profileData;
      const { error } = await supabase
        .schema("users")
        .from("profiles")
        .update(updateFields)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return profileData;
    },
    onMutate: async (profileData) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: profileData.id }),
        entity: { ...profileData, id: profileData.id },
        type: 'update',
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newProfile, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: variables.id }),
        entity: { id: variables.id },
        newEntity: newProfile,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: variables.id }),
      });
      invalidateKeys({
        queryClient,
        keyFactory: () => profileKeyFactory(),
      });
    },
  });
};

// Delete a profile
export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .schema("users")
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw new Error(error.message);
    },
    onMutate: async (userId) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: userId }),
        entity: { id: userId },
        type: 'remove',
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, userId) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: userId }),
      });
      invalidateKeys({
        queryClient,
        keyFactory: () => profileKeyFactory(),
      });
    },
  });
};
