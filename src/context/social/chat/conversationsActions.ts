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
  created_by?: string;
  updated_at?: string | null;
  avatar_url?: string;
  title: string | null;
  is_group?: boolean;
  message_attachments?: {
  id: string;
  url: string;
  mime_type: string | null;
  message_id: string | null;
  profile_id: string | null;
  created_at: string;
}[];
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

const buildFullConversation = (partial: Partial<Conversation>): Conversation => ({
  id: partial.id || `temp-${Date.now()}`,
  created_by: partial.created_by ?? "",
  created_at: partial.created_at ?? new Date().toISOString(),
  updated_at: partial.updated_at ?? null,
  title: partial.title ?? "",
  is_group: partial.is_group ?? false,
  avatar_url: partial.avatar_url ?? "",
});

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
        .select(`
          *,
          message_attachments (
            id,
            url,
            mime_type,
            message_id,
            profile_id,
            created_at
          )
        `)
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
      const optimisticConv = buildFullConversation(conversation);
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...optimisticConv, profileId: optimisticConv.created_by },
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newConversation, _variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: newConversation,
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
      const updatedConv = buildFullConversation({ ...conversation, ...updates });
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...updatedConv, profileId: updatedConv.created_by },
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newConversation, _variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: newConversation,
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
      const conv = buildFullConversation(conversation);
      return optimisticUpdate({
        queryClient,
        keyFactory: conversationKeyFactory,
        entity: { ...conv, profileId: conv.created_by },
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
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
