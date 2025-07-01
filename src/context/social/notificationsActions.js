import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../supabase";
import { notificationKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

/* ────── fetch list ────── */
export const useUserNotificationsQuery = (profile_id) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: notificationKeyFactory({ profileId: profile_id }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      data.forEach((n) =>
        queryClient.setQueryData(
          notificationKeyFactory({ id: n.id }).single,
          n
        )
      );

      return data;
    },
    enabled: !!profile_id,
  });
};

/* ────── insert ────── */
export const useInsertNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (n) => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .insert(n)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (n) =>
      optimisticUpdate({
        queryClient,
        keyFactory: notificationKeyFactory,
        type: "add",
        entity: { ...n, profileId: n.profile_id },
      }),

    onSuccess: (newN, vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: notificationKeyFactory,
        entity: { ...vars, profileId: vars.profile_id },
        newEntity: newN,
      }),

    onError: (_e, vars, ctx) =>
      rollbackCache({
        queryClient,
        keyFactory: notificationKeyFactory,
        entity: { ...vars, profileId: vars.profile_id },
        previousData: ctx,
      }),

    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: notificationKeyFactory,
        entity: { ...vars, profileId: vars.profile_id },
      }),
  });
};

/* ────── update (mark as read) ────── */
export const useUpdateNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (n) => {
      const { id, profile_id, ...rest } = n;
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .update(rest)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (n) =>
      optimisticUpdate({
        queryClient,
        keyFactory: notificationKeyFactory,
        type: "update",
        entity: { ...n, profileId: n.profile_id },
      }),

    onError: (_e, vars, ctx) =>
      rollbackCache({
        queryClient,
        keyFactory: notificationKeyFactory,
        entity: { ...vars, profileId: vars.profile_id },
        previousData: ctx,
      }),

    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: notificationKeyFactory,
        entity: { ...vars, profileId: vars.profile_id },
      }),
  });
};

/* ────── realtime feed ────── */
export const useNotificationsRealtime = (profile_id) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile_id) return;

    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "social",
          table: "notifications",
          filter: `profile_id=eq.${profile_id}`,
        },
        () =>
          queryClient.invalidateQueries({
            queryKey: notificationKeyFactory({ profileId: profile_id }).all,
          })
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [profile_id, queryClient]);
};
