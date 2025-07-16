import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../context/helpers/cacheHandler";
import { groupEventRsvpsKeyFactory } from "../helpers/groups/groupsKeys";

export interface EventRsvp {
  event_id: string; // UUID, references groups.group_events(id)
  profile_id: string; // UUID, references users.profiles(id)
  status: "attending" | "not_attending" | "pending";
  updated_at: string | null; // timestamptz
}

// --- FETCH ALL RSVPs FOR EVENT ---
export const useFetchEventRsvpsQuery = (eventId: string): UseQueryResult<EventRsvp[]> =>
  useQuery<EventRsvp[]>({
    queryKey: groupEventRsvpsKeyFactory({ eventId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as EventRsvp[];
    },
    enabled: !!eventId,
  });

// --- FETCH RSVP FOR PROFILE ---
export const useFetchUserRsvpQuery = (eventId: string, profileId: string): UseQueryResult<EventRsvp> =>
  useQuery<EventRsvp>({
    queryKey: groupEventRsvpsKeyFactory({ eventId }).byId(profileId),
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("profile_id", profileId)
        .single();
      if (error) throw new Error(error.message);
      return data as EventRsvp;
    },
    enabled: !!eventId && !!profileId,
  });

// --- UPSERT RSVP ---
export const useUpsertRsvpMutation = (): UseMutationResult<EventRsvp, Error, EventRsvp> => {
  const queryClient = useQueryClient();
  return useMutation<EventRsvp, Error, EventRsvp>({
    mutationFn: async (rsvp) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("event_rsvps")
        .upsert([rsvp], { onConflict: "event_id,profile_id" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as EventRsvp;
    },
    onMutate: async (rsvp) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: { eventId: rsvp.event_id, profileId: rsvp.profile_id },
        type: "update",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context as Record<string, unknown> | undefined }),
    onSuccess: (newRsvp, vars) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: { eventId: vars.event_id },
        newEntity: { ...newRsvp, eventId: newRsvp.event_id },
      });
    },
    onSettled: (_data, _error, vars) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: { eventId: vars.event_id },
      });
    },
  });
};
