import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../../supabase";

// FETCH USER NOTIFICATIONS
export const useUserNotificationsQuery = (profile_id) => {
  return useQuery({
    queryKey: ["userNotifications", profile_id],
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
      await queryClient.cancelQueries({ queryKey: ["userNotifications", notification.profile_id] });

      const previousData = queryClient.getQueryData(["userNotifications", notification.profile_id]);

      const optimisticNotification = {
        id: `temp-${Date.now()}`,
        ...notification,
        created_at: new Date().toISOString(),
        is_read: false,
      };

      queryClient.setQueryData(["userNotifications", notification.profile_id], (old = []) => [
        optimisticNotification,
        ...old,
      ]);

      return { previousData };
    },

    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["userNotifications", variables.profile_id], context.previousData);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications", variables.profile_id] });
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
      // Cancel ongoing queries for userNotifications
      await queryClient.cancelQueries(["userNotifications", profile_id]);

      // Get the current cache data
      const previousData = queryClient.getQueryData(["userNotifications", profile_id]);

      // Optimistically update the cache
      queryClient.setQueryData(["userNotifications", profile_id], (old = []) =>
        old.map((notif) =>
          notif.id === id ? { ...notif, ...updatedFields } : notif
        )
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback the cache to the previous state on error
      queryClient.setQueryData(["userNotifications", context.profile_id], context.previousData);
    },
    onSettled: (_data, _error, variables) => {
      // Invalidate the query to refetch the latest data
      queryClient.invalidateQueries(["userNotifications", variables.profile_id]);
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
            queryKey: ["userNotifications", profile_id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile_id, queryClient]);
};
