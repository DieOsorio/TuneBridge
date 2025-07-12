import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupFollowsKeyFactory } from "../helpers/groups/groupsKeys";

/* ─── constants ─────────────────────────────────────────────── */
const SCHEMA = "groups";
const TABLE  = "profile_group_follows";

const rowMatch = (a, b) =>
  a?.profile_group_id    === b?.profile_group_id &&
  a?.follower_profile_id === b?.follower_profile_id;

const hydrate = (row) => ({
  ...row,
  profileGroupId    : row.profile_group_id,
  followerProfileId : row.follower_profile_id,
});

const PAGE_SIZE = 8;

/* ─── queries ──────────────────────────────────────────────── */


export const useGroupFollowersInfiniteQuery = (groupId) => {
  return useInfiniteQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId: groupId }).followersInfinite,
    enabled: !!groupId,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      const lastCreatedAt = lastPage[lastPage.length - 1]?.created_at;
      return lastCreatedAt;
    },
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .schema("groups")
        .from("profile_group_followers_expanded")
        .select("*")
        .eq("profile_group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        query = query.lt("created_at", pageParam);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      return data; // ya vienen listos
    },
    staleTime: 60_000,
  });
};




export const useFollowersOfGroupQuery = (profileGroupId) =>
  useQuery({
    queryKey : profileGroupFollowsKeyFactory({ profileGroupId }).followers,
    enabled  : !!profileGroupId,
    queryFn  : async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id")
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return data.map((r) => r.follower_profile_id);
    },
    staleTime : 60_000,
  });

export const useCountFollowers = (profileGroupId) =>
  useQuery({
    queryKey: profileGroupFollowsKeyFactory({ profileGroupId }).followers,
    enabled: !! profileGroupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .select("follower_profile_id")
        .eq("profile_group_id", profileGroupId);
      
      if (error) throw new Error(error.message);
      return data.length;
    }
  })

export const useFollowRowQuery = (profileGroupId, followerId) =>
  useQuery({
    queryKey : profileGroupFollowsKeyFactory({
      profileGroupId,
      followerProfileId : followerId,
    }).single,
    enabled  : !!profileGroupId && !!followerId,
    queryFn  : async () => {
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

/* ─── mutations ─────────────────────────────────────────────── */
export const useFollowGroupMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn : async (row) => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .insert(row)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },

    onMutate : async (row) => {
      /* update followers array optimistically */
      qc.setQueryData(
        profileGroupFollowsKeyFactory({ profileGroupId: row.profile_group_id }).followers,
        (prev = []) =>
          prev.includes(row.follower_profile_id)
            ? prev
            : [...prev, row.follower_profile_id],
      );

      return optimisticUpdate({
        queryClient : qc,
        keyFactory  : profileGroupFollowsKeyFactory,
        entity      : hydrate(row),
        type        : "add",
        idKey       : rowMatch,
      });
    },

    onError   : (_e, _v, ctx) => rollbackCache({ queryClient: qc, previousData: ctx }),

    onSuccess : (saved, vars) =>
      replaceOptimisticItem({
        queryClient : qc,
        keyFactory  : profileGroupFollowsKeyFactory,
        entity      : hydrate(vars),
        newEntity   : hydrate(saved),
        idKey       : rowMatch,
      }),

    onSettled : (_d, _e, vars) =>
      invalidateKeys({
        queryClient : qc,
        keyFactory  : () =>
          profileGroupFollowsKeyFactory({ profileGroupId: vars.profile_group_id }),
      }),
  });
};

export const useUnfollowGroupMutation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn : async (row) => {
      const { error } = await supabase
        .schema(SCHEMA)
        .from(TABLE)
        .delete()
        .eq("profile_group_id",    row.profile_group_id)
        .eq("follower_profile_id", row.follower_profile_id);
      if (error) throw new Error(error.message);
      return row;
    },

    onMutate : async (row) => {
      const entity = hydrate(row);

      /* 1⃣ immediately drop row for “am I following?” */
      qc.setQueryData(
        profileGroupFollowsKeyFactory({
          profileGroupId    : row.profile_group_id,
          followerProfileId : row.follower_profile_id,
        }).single,
        null,
      );

      /* 2⃣ update followers array */
      qc.setQueryData(
        profileGroupFollowsKeyFactory({ profileGroupId: row.profile_group_id }).followers,
        (prev = []) => prev.filter((uid) => uid !== row.follower_profile_id),
      );

      return optimisticUpdate({
        queryClient : qc,
        keyFactory  : profileGroupFollowsKeyFactory,
        entity,
        type        : "remove",
        idKey       : rowMatch,
      });
    },

    onError   : (_e, _v, ctx) => rollbackCache({ queryClient: qc, previousData: ctx }),

    onSettled : (_d, _e, vars) =>
      invalidateKeys({
        queryClient : qc,
        keyFactory  : () =>
          profileGroupFollowsKeyFactory({ profileGroupId: vars.profile_group_id }),
      }),
  });
};
