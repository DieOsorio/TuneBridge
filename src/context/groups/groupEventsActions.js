import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../context/helpers/cacheHandler";
import { groupEventsKeyFactory } from "../helpers/groups/groupsKeys";

// --- FETCH ALL EVENTS FOR GROUP ---
export const useFetchGroupEventsQuery = (profileGroupId) =>
  useQuery({
    queryKey: groupEventsKeyFactory({ profileGroupId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .select("*")
        .eq("profile_group_id", profileGroupId)
        .order("start_time", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileGroupId,
  });

// --- FETCH SINGLE EVENT BY ID ---
export const useFetchGroupEventQuery = (profileGroupId, eventId) =>
  useQuery({
    queryKey: groupEventsKeyFactory({ profileGroupId }).byId(eventId),
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!eventId && !!profileGroupId,
  });

// --- CREATE EVENT ---
export const useCreateGroupEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEvent) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .insert(newEvent)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (newEvent) => {
      const optimisticEvent = {
        ...newEvent,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: optimisticEvent,
        type: "add",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context }),
    onSuccess: (event, vars) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { id: vars.id },
        newEntity: event,
      });
    },
    onSettled: (_data, _error, vars) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: vars.profile_group_id },
      });
    },
  });
};

// --- UPDATE EVENT ---
export const useUpdateGroupEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, updates }) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async ({ eventId, updates }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { id: eventId, ...updates },
        type: "update",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context }),
    onSuccess: (newEvent, { eventId }) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { id: eventId },
        newEntity: newEvent,
      });
    },
    onSettled: (_data, _error, { eventId, profileGroupId }) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { id: eventId, profileGroupId },
      });
    },
  });
};

// --- DELETE EVENT ---
export const useDeleteGroupEventMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event) => {
      const { id } = event;
      const { error } = await supabase
        .schema("groups")
        .from("group_events")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onMutate: async (event) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { id: event.id },
        type: "remove",
      });
    },
    onError: (_err, _vars, context) => 
      rollbackCache({ queryClient, previousData: context }),
    onSettled: (_data, _error, event) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: event.profile_group_id },
      });
    },
  });
};
