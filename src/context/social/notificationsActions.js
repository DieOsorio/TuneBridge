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

// FETCH USER NOTIFICATIONS
export const useUserNotificationsQuery = (profile_id) => {
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
      return data;
    },
    enabled: !!profile_id
  });
};

// INSERT NOTIFICATION
export const useInsertNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notification) => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .insert(notification)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (notification) => {
      return optimisticUpdate({
        queryClient,
        entity: notification,
        keyFactory: notificationKeyFactory,
        type: "add",
      });
    },
    onSuccess: (newNotification, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: variables,
        newEntity: newNotification,
        keyFactory: notificationKeyFactory,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables,
        keyFactory: notificationKeyFactory,
      });
    },
  });
};

// UPDATE NOTIFICATION (e.g., mark as read)
export const useUpdateNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedFields }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, updatedFields, profile_id }) => {
      return optimisticUpdate({
        queryClient,
        entity: { id, ...updatedFields, profile_id },
        keyFactory: notificationKeyFactory,
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        entity: variables,
        keyFactory: notificationKeyFactory,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables,
        keyFactory: notificationKeyFactory,
      });
    },
  });
};

// REALTIME HOOK
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
        () => {
          queryClient.invalidateQueries({
            queryKey: notificationKeyFactory({ profileId: profile_id }).all,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile_id, queryClient]);
};
