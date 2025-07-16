import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../context/helpers/cacheHandler";
import { groupEventsKeyFactory } from "../helpers/groups/groupsKeys";

export interface GroupEvent {
  id: string; 
  profile_group_id: string; 
  title: string;
  description: string | null;
  location: string | null;
  type: "rehearsal" | "gig" | "meeting";
  start_time: string; 
  end_time: string; 
  created_by: string; 
  created_at: string;
}

// --- FETCH ALL EVENTS FOR GROUP ---
export const useFetchGroupEventsQuery = (profileGroupId: string): UseQueryResult<GroupEvent[]> =>
  useQuery<GroupEvent[]>({
    queryKey: groupEventsKeyFactory({ profileGroupId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .select("*")
        .eq("profile_group_id", profileGroupId)
        .order("start_time", { ascending: true });
      if (error) throw new Error(error.message);
      return data as GroupEvent[];
    },
    enabled: !!profileGroupId,
  });

// --- FETCH SINGLE EVENT BY ID ---
export const useFetchGroupEventQuery = (profileGroupId: string, eventId: string): UseQueryResult<GroupEvent> =>
  useQuery<GroupEvent>({
    queryKey: groupEventsKeyFactory({ profileGroupId }).byId(eventId),
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (error) throw new Error(error.message);
      return data as GroupEvent;
    },
    enabled: !!eventId && !!profileGroupId,
  });

// --- CREATE EVENT ---
export const useCreateGroupEventMutation = (): UseMutationResult<GroupEvent, Error, Partial<GroupEvent>> => {
  const queryClient = useQueryClient();
  return useMutation<GroupEvent, Error, Partial<GroupEvent>>({
    mutationFn: async (newEvent) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .insert(newEvent)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as GroupEvent;
    },
    onMutate: async (newEvent) => {
      const optimisticEvent: GroupEvent = {
        ...newEvent,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        profile_group_id: newEvent.profile_group_id ?? "",
        title: newEvent.title ?? "",
        type: newEvent.type ?? "rehearsal",
        start_time: newEvent.start_time ?? new Date().toISOString(),
        end_time: newEvent.end_time ?? new Date().toISOString(),
        created_by: newEvent.created_by ?? "",
      } as GroupEvent;
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: optimisticEvent.profile_group_id },
        type: "add",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context as Record<string, unknown> | undefined }),
    onSuccess: (event, vars) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: event.profile_group_id },
        newEntity: { ...event, profileGroupId: event.profile_group_id },
      });
    },
    onSettled: (_data, _error, event) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: event?.profile_group_id ?? "" },
      });
    },
  });
};

// --- UPDATE EVENT ---
export const useUpdateGroupEventMutation = (): UseMutationResult<GroupEvent, Error, { eventId: string; updates: Partial<GroupEvent> }> => {
  const queryClient = useQueryClient();
  return useMutation<GroupEvent, Error, { eventId: string; updates: Partial<GroupEvent> }>({
    mutationFn: async ({ eventId, updates }) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("group_events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as GroupEvent;
    },
    onMutate: async ({ eventId, updates }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: updates.profile_group_id ?? "" },
        type: "update",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context as Record<string, unknown> | undefined }),
    onSuccess: (newEvent, { eventId }) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: newEvent.profile_group_id },
        newEntity: { ...newEvent, profileGroupId: newEvent.profile_group_id },
      });
    },
    onSettled: (_data, _error, context) => {
      // context puede ser { eventId, updates } o el evento actualizado
      const profileGroupId = context?.updates?.profile_group_id ?? "";
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId },
      });
    },
  });
};

// --- DELETE EVENT ---
export const useDeleteGroupEventMutation = (): UseMutationResult<void, Error, GroupEvent> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, GroupEvent>({
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
        entity: { profileGroupId: event.profile_group_id },
        type: "remove",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context as Record<string, unknown> | undefined }),
    onSettled: (_data, _error, event) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventsKeyFactory,
        entity: { profileGroupId: event.profile_group_id },
      });
    },
  });
};
