import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  useInfiniteQuery,
  UseMutationResult,
  UseQueryResult,
  UseInfiniteQueryResult
} from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { useMemo } from "react";
import { 
  optimisticUpdate, 
  rollbackCache, 
  replaceOptimisticItem, 
  invalidateKeys 
} from '../helpers/cacheHandler';
import { profileKeyFactory } from '../helpers/profile/profileKeys';

export interface Profile {
  id: string;
  firstname?: string | null;
  lastname?: string | null;
  bio?: string | null;
  username: string;
  avatar_url?: string | null;
  country?: string | null;
  state?: string | null;
  neighborhood?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  email?: string | null;
  last_seen: string | null;
}

// -----------------------------
// HOOKS
// -----------------------------

// Match score between one profile and the rest
export const useGetProfilesMatch = (): UseMutationResult<
  any[], // data returned (array, adjust if known)
  Error, // error type
  { profileId: string; limit: number } // variables to mutation
> => {
  return useMutation({
    mutationFn: async ({ profileId, limit }) => {
      const { data, error } = await supabase
        .schema("users")
        .rpc("profile_match_all", {
          profile_a: profileId,
          limit_results: limit,
        });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// Touch last seen for the current user
export const useLastSeen = (): UseMutationResult<
  void, // no data returned
  Error,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["touchLastSeen"],
    mutationFn: async () => {
      const { error } = await supabase.rpc("touch_profile_last_seen");
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userId = session?.user?.id;
      if (!userId) return;

      invalidateKeys({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: userId }).lastSeen,
      });
      invalidateKeys({
        queryClient,
        keyFactory: () => ({
          lastSeen: profileKeyFactory({ id: userId }).lastSeen,
        }),
      });
    },
  });
};

// Match score between two profiles
export const useGetProfileMatchScore = (): UseMutationResult<
  number, // returns the match score number
  Error,
  { profileAId: string; profileBId: string }
> => {
  return useMutation({
    mutationFn: async ({ profileAId, profileBId }) => {
      const { data, error } = await supabase
        .schema("users")
        .rpc("profile_match_score", {
          profile_a: profileAId,
          profile_b: profileBId,
        });

      if (error) throw new Error(error.message);
      return data?.[0]?.match_score ?? 0;
    },
  });
};

// INFINITE SCROLL FOR ALL PROFILES
const PAGE_SIZE = 8; // Number of profiles to fetch per page

export const useInfiniteProfilesQuery = (): UseInfiniteQueryResult<Profile[], Error> => {
  return useInfiniteQuery({
    queryKey: profileKeyFactory({ infinite: true }).infinite!,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return data as Profile[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });
};

// Fetch profiles based on search term
export const useSearchProfilesQuery = (searchTerm: string): UseQueryResult<Profile[], Error> => {
  return useQuery({
    queryKey: profileKeyFactory({ searchTerm }).search!,
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
    select: (data) => (Array.isArray(data) ? data : []),
  });
};

// Fetch all profiles
export const useAllProfilesQuery = (): UseQueryResult<Profile[], Error> => {
  return useQuery({
    queryKey: profileKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profiles")
        .select("*");
      if (error) throw new Error(error.message);
      return data as Profile[];
    },
  });
};

// Fetch a single profile by id or username
export const useProfileQuery = (
  identifier?: string | null
): UseQueryResult<Profile | null, Error> => {
  const isUUID = !!identifier && identifier.includes("-") && identifier.length === 36;

  const queryKey = isUUID
    ? profileKeyFactory({ id: identifier ?? "" }).single
    : profileKeyFactory({ username: identifier ?? "" }).single;

  return useQuery<Profile | null, Error>({
    queryKey: queryKey ?? ["profile", "unknown"],
    queryFn: async () => {
      if (!identifier) return null;

      const query = supabase
        .schema("users")
        .from("profiles")
        .select("*")
        .eq(isUUID ? "id" : "username", identifier);

      const { data, error } = await query.single();
      if (error) throw new Error(error.message);
      
      return data as Profile;
    },
    enabled: !!identifier,
    retry: false,
  });
};



// Map through an array of profile IDs and access each one
export const useProfilesMap = (
  profileIds: string[] = []
): UseQueryResult<Record<string, Profile>, Error> => {
  const uniqueSortedIds = useMemo(() => [...new Set(profileIds)].sort(), [profileIds]);
  return useQuery({
    queryKey: profileKeyFactory({ profileIds: uniqueSortedIds }).map!,
    enabled: uniqueSortedIds.length > 0,
    queryFn: async () => {
      if (!profileIds || profileIds.length === 0) return {};
      const { data, error } = await supabase
        .schema("users")
        .from("profiles")
        .select('*')
        .in('id', uniqueSortedIds);
      if (error) throw new Error(error.message);
      const map: Record<string, Pick<Profile, 'id' | 'avatar_url' | 'username'>> = {};
      data.forEach(profile => {
        map[profile.id] = profile;
      });
      return map;
    },
  });
};

// Prefetch a single profile
export const usePrefetchProfile = (): ((identifier: string | undefined) => Promise<void>) => {
  const queryClient = useQueryClient();
  return async (identifier?: string) => {
    if (!identifier) return;
    const isUUID = identifier.includes("-") && identifier.length === 36;
    const queryKey = isUUID
      ? profileKeyFactory({ id: identifier }).single!
      : profileKeyFactory({ username: identifier }).single!;
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
        return data as Profile;
      },
    });
  };
};

// Create a profile
export const useCreateProfile = (): UseMutationResult<void, Error, { userId: string; email: string }> => {
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
          state: "",
          neighborhood: "",
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
export const useUpdateProfile = (): UseMutationResult<
  Profile,
  Error,
  Profile
> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
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
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newProfile, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => profileKeyFactory({ id: variables.id }),
        entity: newProfile,
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
export const useDeleteProfile = (): UseMutationResult<
  void,
  Error,
  string
> => {
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
    onError: (_err, _variables, context) => {
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
