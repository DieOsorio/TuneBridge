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

      data.forEach((notif) => {
        queryClient.setQueryData(
          notificationKeyFactory({ id: notif.id }).single,
          notif
        )
      })
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
      const completeNotification = {
        ...notification,
        profile_id: notification.profile_id || profile_id,
      };

      return optimisticUpdate({
        queryClient,
        entity: completeNotification,
        keyFactory: notificationKeyFactory,
        type: "add",
      });
    },

    onSuccess: (newNotification, variables) => {
      const completeNotification = {
        ...variables,
        profile_id: variables.profile_id || profile_id,
      }
      replaceOptimisticItem({
        queryClient,
        entity: completeNotification,
        newEntity: newNotification,
        keyFactory: notificationKeyFactory,
      });
    },

    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        entity: variables,
        keyFactory: notificationKeyFactory,
        previousData: context
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          ...variables,
          profile_id: variables.profile_id || profile_id,
        },
        keyFactory: notificationKeyFactory,
      });
    },
  });
};

// UPDATE NOTIFICATION (e.g., mark as read)
export const useUpdateNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notif) => {
      const { id, profile_id, ...updatedFields} = notif
      const { data, error } = await supabase
        .schema("social")
        .from("notifications")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (notif) => {  
      return optimisticUpdate({
        queryClient,
        entity: notif,
        keyFactory: notificationKeyFactory,
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        entity: variables.notif,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables.notif,
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
