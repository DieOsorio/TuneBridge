import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH USER MESSAGES (sent or received)
export const useFetchMessagesQuery = (profile_id) => {
  return useQuery({
    queryKey: ["messages", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select("*")
        .or(`sender_profile_id.eq.${profile_id},receiver_profile_id.eq.${profile_id}`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile_id,
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
      if (error) throw error;
      return data[0];
    },
    onMutate: async (message) => {
      const keySender = ["messages", message.sender_profile_id];
      const keyReceiver = ["messages", message.receiver_profile_id];

      await queryClient.cancelQueries({ queryKey: keySender });
      await queryClient.cancelQueries({ queryKey: keyReceiver });

      const previousSender = queryClient.getQueryData(keySender);
      const previousReceiver = queryClient.getQueryData(keyReceiver);

      const optimistic = {
        id: `temp-${Date.now()}`,
        ...message,
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData(keySender, (old = []) => [...old, optimistic]);
      queryClient.setQueryData(keyReceiver, (old = []) => [...old, optimistic]);

      return { previousSender, previousReceiver };
    },
    onError: (_err, variables, context) => {
      const keySender = ["messages", variables.sender_profile_id];
      const keyReceiver = ["messages", variables.receiver_profile_id];
      if (context?.previousSender) {
        queryClient.setQueryData(keySender, context.previousSender);
      }
      if (context?.previousReceiver) {
        queryClient.setQueryData(keyReceiver, context.previousReceiver);
      }
    },
    onSettled: (_data, _error, variables) => {
      const keySender = ["messages", variables.sender_profile_id];
      const keyReceiver = ["messages", variables.receiver_profile_id];
      queryClient.invalidateQueries({ queryKey: keySender });
      queryClient.invalidateQueries({ queryKey: keyReceiver });
    },
  });
};

// UPDATE MESSAGE
export const useUpdateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedMessage }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .update(updatedMessage)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data[0];
    },
    onMutate: async ({ id, updatedMessage }) => {
      const allKeys = queryClient.getQueryCache().findAll("messages");
      const context = {};
      allKeys.forEach(({ queryKey }) => {
        context[queryKey] = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old = []) =>
          old.map(msg => (msg.id === id ? { ...msg, ...updatedMessage } : msg))
        );
      });
      return context;
    },
    onError: (_err, { id }, context) => {
      Object.entries(context).forEach(([queryKey, previous]) => {
        queryClient.setQueryData(JSON.parse(queryKey), previous);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};

// DELETE MESSAGE
export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("social")
        .from("messages")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id }) => {
      const allKeys = queryClient.getQueryCache().findAll("messages");
      const context = {};
      allKeys.forEach(({ queryKey }) => {
        context[queryKey] = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, (old = []) =>
          old.filter(msg => msg.id !== id)
        );
      });
      return context;
    },
    onError: (_err, { id }, context) => {
      Object.entries(context).forEach(([queryKey, previous]) => {
        queryClient.setQueryData(JSON.parse(queryKey), previous);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
};
