import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import { participantKeyFactory } from "../../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";

export interface Participant {
  conversation_id: string;
  profile_id: string;
  role?: string;
  [key: string]: any;
}

export interface AddParticipantParams extends Participant {}
export interface UpdateParticipantRoleParams {
  conversation_id: string;
  profile_id: string;
  role: string;
}
export interface RemoveParticipantParams {
  conversation_id: string;
  profile_id: string;
}


const isValidUUID = (id: string): boolean =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);

// Helper to adapt participantKeyFactory for cache helpers
const participantEntityKeyFactory = (entity: Participant) => {
  return participantKeyFactory({ conversationId: entity.conversation_id });
};

export const useFetchParticipantsQuery = (conversationId: string): UseQueryResult<Participant[], Error> => {
  return useQuery<Participant[], Error>({
    queryKey: participantKeyFactory({ conversationId }).all ?? ["participants", conversationId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("*")
        .eq("conversation_id", conversationId);
      if (error) throw new Error(error.message);
      return data as Participant[];
    },
    enabled: isValidUUID(conversationId),
  });
};

export const useAddParticipantMutation = (): UseMutationResult<Participant, Error, AddParticipantParams> => {
  const queryClient = useQueryClient();
  return useMutation<Participant, Error, AddParticipantParams>({
    mutationFn: async (participant) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .insert(participant)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Participant;
    },
    onMutate: async (participant) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: { ...participant },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newParticipant, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: { ...variables },
        newEntity: newParticipant,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: variables,
      });
    },
  });
};

export const useUpdateParticipantRoleMutation = (): UseMutationResult<Participant, Error, UpdateParticipantRoleParams> => {
  const queryClient = useQueryClient();
  return useMutation<Participant, Error, UpdateParticipantRoleParams>({
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
      return data[0] as Participant;
    },
    onMutate: async (variables) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: { ...variables },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newParticipant, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: newParticipant,
        newEntity: newParticipant,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: variables,
      });
    },
  });
};

export const useRemoveParticipantMutation = (): UseMutationResult<void, Error, RemoveParticipantParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, RemoveParticipantParams>({
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
        keyFactory: participantEntityKeyFactory,
        entity: { ...variables, role: "" },
        type: "remove",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: participantEntityKeyFactory,
        entity: { ...variables, role: "" },
      });
    },
  });
};
