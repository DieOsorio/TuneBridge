import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";

const isValidUUID = (id) =>
  typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);


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
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["participants", variables.conversation_id] });
    },
  });
};


// UPDATE PARTICIPANT ROLE
export const useUpdateParticipantRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversation_id, profile_id, role }) => {
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
