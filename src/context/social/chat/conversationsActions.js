import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";

// FIND CONVERSATION
export const useFindConversationWithUser = () => {
  return useMutation({
    mutationFn: async ({ myProfileId, otherProfileId }) => {
      const { data: myConversations, error: error1 } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", myProfileId);

      if (error1) throw new Error(error1.message);

      const conversationIds = myConversations.map((item) => item.conversation_id);
      if (conversationIds.length === 0) return null;

      const { data: sharedConversations, error: error2 } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("profile_id", otherProfileId);

      if (error2) throw new Error(error2.message);
      if (sharedConversations.length === 0) return null;

      const sharedId = sharedConversations[0].conversation_id;

      const { data, error: error3 } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .eq("id", sharedId)
        .single();

      if (error3) throw new Error(error3.message);
      return data;
    },
  });
};

// FETCH A CONVERSATION
export const useFetchConversationQuery = (conversationId) => {
  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!conversationId,
  });
};

// FETCH CONVERSATIONS FOR A USER
export const useFetchConversationsQuery = (profileId) => {
  return useQuery({
    queryKey: ["conversations", profileId],
    queryFn: async () => {
      const { data: conversationParticipants, error: participantError } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId);

      if (participantError) throw new Error(participantError.message);
      const conversationIds = conversationParticipants.map((p) => p.conversation_id);

      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId,
  });
};

// CREATE CONVERSATION
export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversation) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .insert(conversation)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (conversation) => {
      await queryClient.cancelQueries({ queryKey: ["conversations", conversation.created_by] });

      const previousDetails = queryClient.getQueryData(["conversations", conversation.created_by]);
      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...conversation,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["conversations", conversation.created_by], (old = []) => [
        ...old,
        optimisticData,
      ]);

      return { previousDetails, created_by: conversation.created_by };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["conversations", context.created_by], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversation.created_by] });
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversation.id] });
    },
  });
};

// UPDATE CONVERSATION
export const useUpdateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversation, updates }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .update(updates)
        .eq("id", conversation.id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ conversation, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["conversations", conversation.created_by] });

      const previousDetails = queryClient.getQueryData(["conversations", conversation.created_by]);

      queryClient.setQueryData(["conversations", conversation.created_by], (old = []) =>
        old.map((c) => (c.id === conversation.id ? { ...c, ...updates } : c))
      );

      return { previousDetails, created_by: conversation.created_by };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["conversations", context.created_by], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversation.created_by] });
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversation.id] });
    },
  });
};

// DELETE CONVERSATION
export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversation) => {
      const { error } = await supabase
        .schema("social")
        .from("conversations")
        .delete()
        .eq("id", conversation.id);

      if (error) throw new Error(error.message);
    },

    onMutate: async (conversation) => {
      await queryClient.cancelQueries({ queryKey: ["conversations", conversation.created_by] });

      const previousDetails = queryClient.getQueryData(["conversations", conversation.created_by]);

      queryClient.setQueryData(["conversations", conversation.created_by], (old = []) =>
        old.filter((c) => c.id !== conversation.id)
      );

      return { previousDetails, created_by: conversation.created_by };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["conversations", context.created_by], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.conversation.created_by] });
      queryClient.invalidateQueries({ queryKey: ["conversation", variables.conversation.id] });
    },
  });
};
