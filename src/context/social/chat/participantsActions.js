import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";

// FETCH PARTICIPANTS OF A CONVERSATION
export const useFetchParticipantsQuery = (conversationId) => {
  return useQuery({
    queryKey: ["participants", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("*")
        .eq("conversation_id", conversationId);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!conversationId,
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["participants", variables.conversation_id] });
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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["participants", variables.conversation_id] });
    },
  });
};
