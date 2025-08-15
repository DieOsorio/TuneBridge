import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { bannedUsersKeyFactory } from "../helpers/admin/keys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { useEffect } from "react";

export interface BannedUser {
  profile_id: string;
  reason: string;
  banned_until: string | null;
  type: string;
  banned_by: string;
  handled_by?: string;
  created_at: string;
  deleted_at?: string | null;
}

/* ────── check if user is banned ────── */
export const useRealtimeBannedUser = (profile_id: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile_id) return;

    const channel = supabase
      .channel(`realtime-banned-${profile_id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT | UPDATE | DELETE
          schema: "admin",
          table: "banned_users",
          filter: `profile_id=eq.${profile_id}`,
        },
        (payload) => {
          const key = bannedUsersKeyFactory({ profileId: profile_id }).all ?? ["bannedUsers", profile_id];

          if (payload.eventType === "DELETE") {
            queryClient.setQueryData(key, null);
          } else if (payload.new) {
            queryClient.setQueryData(key, payload.new as BannedUser);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile_id, queryClient]);
};

/* ────── fetch all banned users ────── */
export const useAllBannedUsersQuery = () => {
  return useQuery({
    queryKey: bannedUsersKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("banned_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
};


/* ────── fetch banned user by profile_id ────── */
export const useBannedUserQuery = (
  profile_id: string | null
): UseQueryResult<BannedUser | null, Error> => {
  const queryClient = useQueryClient();
  return useQuery<BannedUser | null, Error>({
    queryKey: bannedUsersKeyFactory({ profileId: profile_id ?? "" }).all ?? ["bannedUsers", profile_id ?? ""],
    queryFn: async () => {
      if (!profile_id) return null;
      const { data, error, status, statusText } = await supabase
        .schema("admin")
        .from("banned_users")
        .select("*")
        .eq("profile_id", profile_id)
        .is("deleted_at", null)
        .maybeSingle();

      // Log statu info for debugging
      if (error) {
        console.log("Supabase insert status:", status, statusText);
        console.log("Supabase insert error:", error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!profile_id,
  });
};

/* ────── upsert banned user ────── */
export const useUpsertBannedUserMutation = (): UseMutationResult<BannedUser, Error, Partial<BannedUser>> => {
  const queryClient = useQueryClient();
  return useMutation<BannedUser, Error, Partial<BannedUser>>({
    mutationFn: async (bannedUser) => {      
      const { data, error } = await supabase
        .schema("admin")
        .from("banned_users")
        .upsert(bannedUser, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as BannedUser;
    },
    onMutate: async (bannedUser) =>
      optimisticUpdate({
        queryClient,
        keyFactory: () => bannedUsersKeyFactory({ profileId: bannedUser.profile_id ?? "" }),
        type: "update",
        entity: bannedUser as BannedUser,
      }),
    onError: (_e, vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => bannedUsersKeyFactory({ profileId: vars.profile_id ?? "" }),
        entity: vars as BannedUser,
      }),
  });
};

/* ────── delete banned user ────── */
export const useDeleteBannedUserMutation = (): UseMutationResult<void, Error, { profile_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { profile_id: string }>({
    mutationFn: async ({ profile_id }) => {
      const { error } = await supabase
        .schema("admin")
        .from("banned_users")
        .delete()
        .eq("profile_id", profile_id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ profile_id }) => {
      await queryClient.cancelQueries({
        queryKey: bannedUsersKeyFactory({ profileId: profile_id }).all,
      });
      const key = bannedUsersKeyFactory({ profileId: profile_id }).all ?? ["bannedUsers", profile_id];
      const previousData = queryClient.getQueryData(key);
      queryClient.setQueryData(key, null);
      return { previousData };
    },
    onError: (_e, vars, ctx) => {
      const context = ctx as { previousData?: unknown } | undefined;
      if (context?.previousData) {
        const key = bannedUsersKeyFactory({ profileId: vars.profile_id }).all ?? ["bannedUsers", vars.profile_id];
        queryClient.setQueryData(key, context.previousData);
      }
    },
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => bannedUsersKeyFactory({ profileId: vars.profile_id }),
        entity: { profile_id: vars.profile_id } as BannedUser,
      }),
  });
};
