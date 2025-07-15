import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../context/helpers/cacheHandler";
import { groupEventRsvpsKeyFactory } from "../helpers/groups/groupsKeys";

// --- FETCH ALL RSVPs FOR EVENT ---
export const useFetchEventRsvpsQuery = (eventId) =>
  useQuery({
    queryKey: groupEventRsvpsKeyFactory({ eventId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("groups")
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!eventId,
  });

// --- FETCH RSVP FOR PROFILE ---
export const useFetchUserRsvpQuery = (eventId, profileId) =>
  useQuery({
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
      return data;
    },
    enabled: !!eventId && !!profileId,
  });

// --- UPSERT RSVP ---
export const useUpsertRsvpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rsvp) => {
      const { data, error } = await supabase
        .schema("groups")
        .from("event_rsvps")
        .upsert(rsvp, { onConflict: ["event_id", "profile_id"] })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (rsvp) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: rsvp,
        type: "update",
      });
    },
    onError: (_err, _vars, context) => rollbackCache({ queryClient, previousData: context }),
    onSuccess: (newRsvp, vars) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: {
          eventId: vars.event_id,
          profileId: vars.profile_id,
        },
        newEntity: newRsvp,
      });
    },
    onSettled: (_data, _error, vars) => {
      invalidateKeys({
        queryClient,
        keyFactory: groupEventRsvpsKeyFactory,
        entity: {
          eventId: vars.event_id,
          profileId: vars.profile_id,
        },
      });
    },
  });
};
