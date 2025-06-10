import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import { participantKeyFactory } from "../../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";

const isValidUUID = (id) =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);


// FETCH PARTICIPANTS OF A CONVERSATION
export const useFetchParticipantsQuery = (conversationId) => {
  return useQuery({
    queryKey: participantKeyFactory({ conversationId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("*")
        .eq("conversation_id", conversationId);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: isValidUUID(conversationId),
  });
};

// ADD PARTICIPANT
export const useAddParticipantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participant) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .insert(participant)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (participant) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { ...participant, conversationId: participant.conversation_id },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newParticipant, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { ...variables, conversationId: variables.conversation_id },
        newEntity: newParticipant,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { conversationId: variables.conversation_id },
      });
    },
  });
};

// UPDATE PARTICIPANT ROLE
export const useUpdateParticipantRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      const { conversation_id, profile_id, role } = variables;
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .update({ role })
        .eq("conversation_id", conversation_id)
        .eq("profile_id", profile_id)
        .select();      
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (variables) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { ...variables, conversationId: variables.conversation_id },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newParticipant, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { ...variables, conversationId: variables.conversation_id },
        newEntity: newParticipant,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { conversationId: variables.conversation_id },
      });
    },
  });
};

// REMOVE PARTICIPANT
export const useRemoveParticipantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversation_id, profile_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", conversation_id)
        .eq("profile_id", profile_id);

      if (error) throw new Error(error.message);
    },
    onMutate: async (variables) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { ...variables, conversationId: variables.conversation_id },
        type: "remove",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantKeyFactory,
        entity: { conversationId: variables.conversation_id },
      });
    },
  });
};
