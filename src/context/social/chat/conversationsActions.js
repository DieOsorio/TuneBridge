import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";
import { conversationKeyFactory } from "../../helpers/social/socialKeys";


// FIND CONVERSATION
export const useFindConversationWithUser = () => {
  return useMutation({
    mutationFn: async ({ myProfileId, otherProfileId }) => {
      const { data, error } = await supabase
        .schema("social")
        .rpc("find_one_on_one_conversation", {
          profile_a: myProfileId,
          profile_b: otherProfileId,
        });

      if (error) throw new Error(error.message);
      return data?.[0] || null;
    },
  });
};

// FETCH A CONVERSATION
export const useFetchConversationQuery = (conversationId) => {
  return useQuery({
    queryKey: conversationKeyFactory({ id: conversationId }).single,
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
    queryKey: conversationKeyFactory({ profileId }).all,
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
      const optimisticConv = {
        id: conversation.id || `temp-${Date.now()}`,
        ...conversation,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...optimisticConv, profileId: conversation.created_by },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newConversation, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { id: variables.id || variables.tempId || `temp-${Date.now()}`, profileId: variables.created_by },
        newEntity: newConversation,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { profileId: variables.created_by },
      });
      if (variables.id) {
        invalidateKeys({
          queryClient,
          keyFactory: conversationKeyFactory,
          entity: { id: variables.id },
        });
      }
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
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...conversation, ...updates, profileId: conversation.created_by },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newConversation, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { id: variables.conversation.id, profileId: variables.conversation.created_by },
        newEntity: newConversation,
      });
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.conversation?.created_by) {
        invalidateKeys({
          queryClient,
          keyFactory: conversationKeyFactory,
          entity: { profileId: variables.conversation.created_by },
        });
      }
      if (variables?.conversation?.id) {
        invalidateKeys({
          queryClient,
          keyFactory: conversationKeyFactory,
          entity: { id: variables.conversation.id },
        });
      }
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
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...conversation, profileId: conversation.created_by },
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
        keyFactory: conversationKeyFactory,
        entity: { profileId: variables.created_by },
      });
      if (variables.id) {
        invalidateKeys({
          queryClient,
          keyFactory: conversationKeyFactory,
          entity: { id: variables.id },
        });
      }
    },
  });
};