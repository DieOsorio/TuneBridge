import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";
import { conversationKeyFactory } from "../../helpers/social/socialKeys";

export interface Conversation {
  id: string;
  created_by: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ConversationParticipant {
  conversation_id: string;
  profile_id: string;
}

export interface FindConversationParams {
  myProfileId: string;
  otherProfileId: string;
}

export const useFindConversationWithUser = (): UseMutationResult<Conversation | null, Error, FindConversationParams> => {
  return useMutation<Conversation | null, Error, FindConversationParams>({
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

export const useFetchConversationQuery = (conversationId: string): UseQueryResult<Conversation, Error> => {
  return useQuery<Conversation, Error>({
    queryKey: conversationKeyFactory({ id: conversationId }).single ?? ["conversation", conversationId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();
      if (error) throw new Error(error.message);
      return data as Conversation;
    },
    enabled: !!conversationId,
  });
};

export const useFetchConversationsQuery = (profileId: string): UseQueryResult<Conversation[], Error> => {
  return useQuery<Conversation[], Error>({
    queryKey: conversationKeyFactory({ profileId }).all ?? ["conversations", profileId ?? ""],
    queryFn: async () => {
      const { data: conversationParticipants, error: participantError } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId);
      if (participantError) throw new Error(participantError.message);
      const conversationIds = (conversationParticipants as ConversationParticipant[]).map((p) => p.conversation_id);
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Conversation[];
    },
    enabled: !!profileId,
  });
};

export const useCreateConversationMutation = (): UseMutationResult<Conversation, Error, Partial<Conversation>> => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, Partial<Conversation>>({
    mutationFn: async (conversation) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .insert(conversation)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Conversation;
    },
    onMutate: async (conversation) => {
      const optimisticConv: Conversation = {
        id: conversation.id || `temp-${Date.now()}`,
        created_by: conversation.created_by ?? "",
        ...conversation,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...optimisticConv, profileId: optimisticConv.created_by },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newConversation, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          profileId: variables.created_by ?? "",
          created_by: variables.created_by ?? ""
        },
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

export interface UpdateConversationParams {
  conversation: Conversation;
  updates: Partial<Conversation>;
}

export const useUpdateConversationMutation = (): UseMutationResult<Conversation, Error, UpdateConversationParams> => {
  const queryClient = useQueryClient();
  return useMutation<Conversation, Error, UpdateConversationParams>({
    mutationFn: async ({ conversation, updates }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .update(updates)
        .eq("id", conversation.id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Conversation;
    },
    onMutate: async ({ conversation, updates }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: {
          ...conversation,
          ...updates,
          profileId: conversation.created_by,
          created_by: conversation.created_by
        },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newConversation, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: {
          id: variables.conversation.id,
          profileId: variables.conversation.created_by,
          created_by: variables.conversation.created_by
        },
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

export const useDeleteConversationMutation = (): UseMutationResult<void, Error, Conversation> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Conversation>({
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
        entity: {
          ...conversation,
          profileId: conversation.created_by,
          created_by: conversation.created_by
        },
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
