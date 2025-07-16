import { useQuery, useMutation, useQueryClient, useInfiniteQuery, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupFollowsKeyFactory, ProfileGroupFollowsKeyParams } from "../helpers/groups/groupsKeys";

const SCHEMA = "groups";
const TABLE = "profile_group_follows";

export interface ProfileGroupFollow {
  profile_group_id: string;
  follower_profile_id: string;
  created_at?: string;
}

export interface HydratedProfileGroupFollow extends ProfileGroupFollow {
  profileGroupId: string;
  followerProfileId: string;
}

const hydrate = (row: ProfileGroupFollow): HydratedProfileGroupFollow => ({
  ...row,
  profileGroupId: row.profile_group_id,
  followerProfileId: row.follower_profile_id,
});

const rowMatch = (a: ProfileGroupFollow, b: ProfileGroupFollow) =>
  a?.profile_group_id === b?.profile_group_id &&
  a?.follower_profile_id === b?.follower_profile_id;

const PAGE_SIZE = 8;

export const useFollowersOfGroupQuery = (profileGroupId: string): UseQueryResult<string[]> =>
  useQuery<string[]>({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId }).followers ?? [],
    enabled: !!profileGroupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id")
        .eq("profile_group_id", profileGroupId);
      if (error) throw new Error(error.message);
      return (data ?? []).map((r: any) => r.follower_profile_id);
    },
    staleTime: 60_000,
  });

export const useFollowRowQuery = (profileGroupId: string, followerId: string): UseQueryResult<ProfileGroupFollow | null> =>
  useQuery<ProfileGroupFollow | null>({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId, followerProfileId: followerId }).single ?? [],
    enabled: !!profileGroupId && !!followerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("*")
        .eq("profile_group_id", profileGroupId)
        .eq("follower_profile_id", followerId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ?? null;
    },
  });

export const useCountFollowers = (profileGroupId: string): UseQueryResult<number | null> =>
  useQuery<number | null>({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId }).followers ?? [],
    enabled: !!profileGroupId,
    queryFn: async () => {
      const { count, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id", { count: "exact", head: true })
        .eq("profile_group_id", profileGroupId);
      if (error) throw new Error(error.message);
      return count ?? null;
    },
  });

export const useGroupFollowersInfiniteQuery = (groupId: string) =>
  useInfiniteQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId: groupId }).followersInfinite ?? [],
    enabled: !!groupId,
    initialPageParam: undefined,
    getNextPageParam: (lastPage: any[]) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1]?.created_at;
    },
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .schema("groups")
        .from("profile_group_followers_expanded")
        .select("*")
        .eq("profile_group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (pageParam) query = query.lt("created_at", pageParam);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });

export const useFollowGroupMutation = (): UseMutationResult<ProfileGroupFollow, Error, ProfileGroupFollow> => {
  const queryClient = useQueryClient();
  return useMutation<ProfileGroupFollow, Error, ProfileGroupFollow>({
    mutationFn: async (row) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ProfileGroupFollow;
    },
    onMutate: async (row) => {
      return optimisticUpdate({
        queryClient,
        entity: hydrate(row),
        keyFactory: profileGroupFollowsKeyFactory,
        type: "add",
        idKey: rowMatch,
      });
    },
    onSuccess: (saved, vars) => {
      replaceOptimisticItem({
        queryClient,
        entity: hydrate(vars),
        newEntity: hydrate(saved),
        keyFactory: profileGroupFollowsKeyFactory,
        idKey: rowMatch,
      });
    },
    onError: (_err, vars, ctx) => {
      rollbackCache({
        queryClient,
        previousData: ctx as Record<string, unknown> | undefined,
      });
    },
    onSettled: (_data, _error, vars) => {
      invalidateKeys({
        queryClient,
        entity: hydrate(vars),
        keyFactory: profileGroupFollowsKeyFactory,
      });
    },
  });
};

export const useUnfollowGroupMutation = (): UseMutationResult<ProfileGroupFollow, Error, ProfileGroupFollow> => {
  const queryClient = useQueryClient();
  return useMutation<ProfileGroupFollow, Error, ProfileGroupFollow>({
    mutationFn: async (row) => {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("profile_group_id", row.profile_group_id)
        .eq("follower_profile_id", row.follower_profile_id);
      if (error) throw new Error(error.message);
      return row;
    },
    onMutate: async (row) => {
      return optimisticUpdate({
        queryClient,
        entity: hydrate(row),
        keyFactory: profileGroupFollowsKeyFactory,
        type: "remove",
        idKey: rowMatch,
      });
    },
    onError: (_err, vars, ctx) => {
      rollbackCache({
        queryClient,
        previousData: ctx as Record<string, unknown> | undefined,
      });
    },
    onSettled: (_data, _error, vars) => {
      invalidateKeys({
        queryClient,
        entity: hydrate(vars),
        keyFactory: profileGroupFollowsKeyFactory,
      });
    },
  });
};
