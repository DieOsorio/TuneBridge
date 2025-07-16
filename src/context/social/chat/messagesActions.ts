// Helper to adapt messageKeyFactory for cache helpers
const messageEntityKeyFactory = (entity: Message) => {
  return messageKeyFactory({
    conversationId: entity.conversation_id,
    profileId: entity.sender_profile_id,
  });
};
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import { useEffect } from "react";
import { messageKeyFactory } from "../../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";

export interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  read_by?: string[];
  deleted_at?: string | null;
  created_at?: string;
  [key: string]: any;
}

export interface UnreadMessagesResult {
  total: number;
  perConversation: Record<string, number>;
}

export const useTotalUnreadMessages = (profileId: string): UseQueryResult<UnreadMessagesResult, Error> => {
  return useQuery<UnreadMessagesResult, Error>({
    queryKey: messageKeyFactory({ profileId }).totalUnread ?? ["messages", profileId ?? ""],
    queryFn: async () => {
      const { data: conversations, error: convError } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId);
      if (convError) throw new Error(convError.message);
      const conversationIds = (conversations as { conversation_id: string }[]).map((c) => c.conversation_id);
      if (conversationIds.length === 0) return { total: 0, perConversation: {} };
      const { data: messages, error: msgError } = await supabase
        .schema("social")
        .from("messages")
        .select("id, conversation_id, sender_profile_id, read_by")
        .in("conversation_id", conversationIds)
        .is("deleted_at", null);
      if (msgError) throw new Error(msgError.message);
      const perConversation: Record<string, number> = {};
      (messages as Message[]).forEach((msg) => {
        const hasRead = msg.read_by?.includes?.(profileId);
        const isOwn = msg.sender_profile_id === profileId;
        const isUnread = !hasRead && !isOwn;
        if (isUnread) {
          if (!perConversation[msg.conversation_id]) {
            perConversation[msg.conversation_id] = 0;
          }
          perConversation[msg.conversation_id]++;
        }
      });
      const total = Object.values(perConversation).reduce((sum, count) => sum + count, 0);
      return { total, perConversation };
    },
    enabled: !!profileId,
  });
};

export interface UnreadMessagesParams {
  conversationId: string;
  profileId: string;
}

export const useUnreadMessages = ({ conversationId, profileId }: UnreadMessagesParams): UseQueryResult<Message[], Error> => {
  return useQuery<Message[], Error>({
    queryKey: messageKeyFactory({ conversationId, profileId }).unread ?? ["messages-unread", conversationId ?? "", profileId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select("id, sender_profile_id, read_by")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data as Message[]).filter(
        (msg) =>
          msg.sender_profile_id !== profileId &&
          (!msg.read_by || !msg.read_by.includes(profileId))
      );
    },
    enabled: !!conversationId && !!profileId,
  });
};

export interface MarkMessagesAsReadParams {
  messageIds: string[];
  profileId: string;
  conversationId: string;
}

export const useMarkMessagesAsReadMutation = (): UseMutationResult<any, Error, MarkMessagesAsReadParams> => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, MarkMessagesAsReadParams>({
    mutationFn: async ({ messageIds, profileId, conversationId }) => {
      const updates = messageIds.map(async (id) => {
        const { data: existingData, error: fetchError } = await supabase
          .schema("social")
          .from("messages")
          .select("read_by")
          .eq("id", id)
          .single();
        if (fetchError) throw new Error(fetchError.message);
        const currentReadBy = existingData?.read_by || [];
        if (currentReadBy.includes(profileId)) {
          return;
        }
        const updatedReadBy = [...currentReadBy, profileId];
        const { data, error } = await supabase
          .schema("social")
          .from("messages")
          .update({ read_by: updatedReadBy })
          .eq("id", id)
          .select();
        if (error) throw new Error(error.message);
        return data;
      });
      return Promise.all(updates);
    },
    onSettled: (_data, _error, { conversationId, profileId }) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageKeyFactory,
        entity: { conversationId, profileId },
      });
      invalidateKeys({
        queryClient,
        keyFactory: messageKeyFactory,
        entity: { conversationId },
      });
    },
  });
};

export const useMessagesRealtime = (conversation_id: string): void => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!conversation_id) return;
    const channel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "social",
          table: "messages",
          filter: `conversation_id=eq.${conversation_id}`,
        },
        () => {
          invalidateKeys({
            queryClient,
            keyFactory: messageKeyFactory,
            entity: { conversationId: conversation_id },
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id, queryClient]);
};

export const useFetchMessagesQuery = (conversationId: string): UseQueryResult<Message[], Error> => {
  return useQuery<Message[], Error>({
    queryKey: messageKeyFactory({ conversationId }).all ?? ["messages", conversationId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data as Message[];
    },
    enabled: !!conversationId,
  });
};

export const useInsertMessageMutation = (): UseMutationResult<Message, Error, Partial<Message>> => {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, Partial<Message>>({
    mutationFn: async (message) => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .insert(message)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Message;
    },
    onMutate: async (message) => {
      const optimisticMsg: Message = {
        id: message.id || `temp-${Date.now()}`,
        conversation_id: message.conversation_id ?? "",
        sender_profile_id: message.sender_profile_id ?? "",
        ...message,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: messageEntityKeyFactory,
        entity: {
          id: optimisticMsg.id,
          conversation_id: optimisticMsg.conversation_id,
          sender_profile_id: optimisticMsg.sender_profile_id
        },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newMessage, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: messageEntityKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          conversation_id: variables.conversation_id ?? "",
          sender_profile_id: variables.sender_profile_id ?? ""
        },
        newEntity: newMessage,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageKeyFactory,
        entity: { conversationId: variables.conversation_id ?? "" },
      });
    },
  });
};

export interface UpdateMessageParams {
  id: string;
  updatedFields: Partial<Message>;
  conversation_id: string;
}

export const useUpdateMessageMutation = (): UseMutationResult<Message, Error, UpdateMessageParams> => {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, UpdateMessageParams>({
    mutationFn: async ({ id, updatedFields, conversation_id }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .update(updatedFields)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Message;
    },
    onMutate: async ({ id, updatedFields, conversation_id }) => {
      const key = messageKeyFactory({ conversationId: conversation_id }).all ?? ["messages", conversation_id ?? ""];
      const prev = queryClient.getQueryData(key);
      const original = Array.isArray(prev) ? (prev as Message[]).find(m => m.id === id) : undefined;
      const optimisticEntity: Message = original
        ? { ...original, ...updatedFields }
        : {
            id,
            conversation_id,
            sender_profile_id: updatedFields.sender_profile_id ?? "",
            ...updatedFields
          };
      return optimisticUpdate({
        queryClient,
        keyFactory: messageEntityKeyFactory,
        entity: {
          id: optimisticEntity.id,
          conversation_id: optimisticEntity.conversation_id,
          sender_profile_id: optimisticEntity.sender_profile_id
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
    onSuccess: (newMessage, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: messageEntityKeyFactory,
        entity: {
          id: variables.id,
          conversation_id: variables.conversation_id,
          sender_profile_id: newMessage.sender_profile_id
        },
        newEntity: newMessage,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageKeyFactory,
        entity: { conversationId: variables.conversation_id },
      });
    },
  });
};

export interface DeleteMessageParams {
  id: string;
  conversation_id: string;
}

export const useDeleteMessageMutation = (): UseMutationResult<void, Error, DeleteMessageParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteMessageParams>({
    mutationFn: async ({ id, conversation_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, conversation_id }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: messageEntityKeyFactory,
        entity: { id, conversation_id, sender_profile_id: "" },
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
        keyFactory: messageKeyFactory,
        entity: { conversationId: variables.conversation_id },
      });
    },
  });
};
