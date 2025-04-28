import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";

// FETCH MESSAGES FROM A CONVERSATION
export const useFetchMessagesQuery = (conversationId) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!conversationId,
  });
};

// INSERT NEW MESSAGE
export const useInsertMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message) => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .insert(message)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ["messages", message.conversation_id] });

      const previousMessages = queryClient.getQueryData(["messages", message.conversation_id]);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        ...message,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", message.conversation_id], (old = []) => [
        ...old,
        optimisticMessage,
      ]);

      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", _vars.conversation_id], context.previousMessages);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversation_id] });
    },
  });
};

// UPDATE MESSAGE
export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedFields }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .update(updatedFields)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversation_id] });
    },
  });
};

// DELETE MESSAGE (soft delete)
export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("social")
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.conversation_id] });
    },
  });
};
