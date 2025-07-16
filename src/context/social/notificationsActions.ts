import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../supabase";
import { notificationKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface Notification {
  id: string;
  profile_id: string;
  created_at: string;
  [key: string]: any;
}

/* ────── fetch list ────── */
export const useUserNotificationsQuery = (profile_id: string): UseQueryResult<Notification[], Error> => {
  const queryClient = useQueryClient();
  // Strict fallback tuple for user notifications
  const USER_NOTIFICATIONS_FALLBACK_KEY = (profileId: string): ["userNotifications", string] => ["userNotifications", profileId];
  return useQuery<Notification[], Error>({
    queryKey: notificationKeyFactory({ profileId: profile_id }).all ?? USER_NOTIFICATIONS_FALLBACK_KEY(profile_id ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      // Strict fallback tuple for single notification
      const NOTIFICATION_FALLBACK_KEY = (id: string): ["notification", string] => ["notification", id];
      (data ?? []).forEach((_n: Notification) => {
        // Ensure n always has required fields as string
        const n: Notification = {
          ..._n,
          id: _n.id ?? "",
          profile_id: _n.profile_id ?? "",
          created_at: _n.created_at ?? "",
        };
        queryClient.setQueryData(
          notificationKeyFactory({ id: n.id }).single ?? NOTIFICATION_FALLBACK_KEY(n.id ?? ""),
          n
        );
      });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!profile_id,
    select: (data) => Array.isArray(data) ? data : [],
  });
};

/* ────── insert ────── */
export const useInsertNotificationMutation = (): UseMutationResult<Notification, Error, Partial<Notification>> => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, Partial<Notification>>({
    mutationFn: async (n) => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .insert(n)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Notification;
    },
    onMutate: async (n) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Notification) => notificationKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userNotifications", entity.profile_id ?? ""] },
        type: "add",
        entity: { ...n, profile_id: n.profile_id ?? "", id: n.id ?? "", created_at: n.created_at ?? "" },
      }),
    onSuccess: (newN, vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: Notification) => notificationKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userNotifications", entity.profile_id ?? ""] },
        entity: { ...vars, profile_id: vars.profile_id ?? "", id: vars.id ?? "", created_at: vars.created_at ?? "" },
        newEntity: newN,
      }),
    onError: (_e, vars, ctx) =>
      rollbackCache({
        queryClient,
        previousData: ctx as Record<string, unknown>,
      }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Notification) => notificationKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userNotifications", entity.profile_id ?? ""] },
        entity: { ...vars, profile_id: vars.profile_id ?? "", id: vars.id ?? "", created_at: vars.created_at ?? "" },
      }),
  });
};

/* ────── update (mark as read) ────── */
export const useUpdateNotificationMutation = (): UseMutationResult<Notification, Error, Partial<Notification>> => {
  const queryClient = useQueryClient();
  return useMutation<Notification, Error, Partial<Notification>>({
    mutationFn: async (n) => {
      const { id, profile_id, ...rest } = n;
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Notification;
    },
    onMutate: async (n) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Notification) => notificationKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userNotifications", entity.profile_id ?? ""] },
        type: "update",
        entity: { ...n, profile_id: n.profile_id ?? "", id: n.id ?? "", created_at: n.created_at ?? "" },
      }),
    onError: (_e, vars, ctx) =>
      rollbackCache({
        queryClient,
        previousData: ctx as Record<string, unknown>,
      }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Notification) => notificationKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userNotifications", entity.profile_id ?? ""] },
        entity: { ...vars, profile_id: vars.profile_id ?? "", id: vars.id ?? "", created_at: vars.created_at ?? "" },
      }),
  });
};

/* ────── realtime feed ────── */
export const useNotificationsRealtime = (profile_id: string) => {
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
        () => {
          const USER_NOTIFICATIONS_FALLBACK_KEY = (profileId: string): ["userNotifications", string] => ["userNotifications", profileId];
          queryClient.invalidateQueries({
            queryKey: notificationKeyFactory({ profileId: profile_id }).all ?? USER_NOTIFICATIONS_FALLBACK_KEY(profile_id ?? ""),
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile_id, queryClient]);
};
