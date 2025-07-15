import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupFollowsKeyFactory } from "../helpers/groups/groupsKeys";

const SCHEMA = "groups";
const TABLE = "profile_group_follows";

const hydrate = (row) => ({
  ...row,
  profileGroupId: row.profile_group_id,
  followerProfileId: row.follower_profile_id,
});

const rowMatch = (a, b) =>
  a?.profile_group_id === b?.profile_group_id &&
  a?.follower_profile_id === b?.follower_profile_id;

const PAGE_SIZE = 8;

// Get followers (plane list of ID's)
export const useFollowersOfGroupQuery = (profileGroupId) =>
  useQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId }).followers,
    enabled: !!profileGroupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id")
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return data.map((r) => r.follower_profile_id);
    },
    staleTime: 60_000,
  });

// Get state of follow between the user and the profile group
export const useFollowRowQuery = (profileGroupId, followerId) =>
  useQuery({
    queryKey: profileGroupFollowsKeyFactory({
      profileGroupId,
      followerProfileId: followerId,
    }).single,
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
      return data;
    },
  });

// Simple counter of followers
export const useCountFollowers = (profileGroupId) =>
  useQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId }).followers,
    enabled: !!profileGroupId,
    queryFn: async () => {
      const { count, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id", { count: "exact", head: true })
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return count;
    },
  });

// Infinite list of followers
export const useGroupFollowersInfiniteQuery = (groupId) =>
  useInfiniteQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId: groupId }).followersInfinite,
    enabled: !!groupId,
    getNextPageParam: (lastPage) => {
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
      return data;
    },
    staleTime: 60_000,
  });

// Follow mutation
export const useFollowGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (row) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(row)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
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
        entity: hydrate(vars),
        keyFactory: profileGroupFollowsKeyFactory,
        previousData: ctx,
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

// Unfollow mutation
export const useUnfollowGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
        entity: hydrate(vars),
        keyFactory: profileGroupFollowsKeyFactory,
        previousData: ctx,
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