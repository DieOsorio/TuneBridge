import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { useEffect } from "react";
import { messageKeyFactory } from "../../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";

import { playBeep } from "@/utils/playBeep";
import { MessageAttachment } from "./messageAttachmentsActions";

export interface Message {
  id: string;
  conversation_id: string;
  sender_profile_id: string;
  content: string;
  read_by?: string[];
  delivered_to?: string[];
  deleted_at?: string | null;
  updated_at?: string | null;
  attachment_id?: string | null;
  attachment?: MessageAttachment;
  [key: string]: any;
}

export interface UnreadMessagesResult {
  total: number;
  perConversation: Record<string, number>;
}

export function mapMessageFromSupabase(raw: any): Message {
  return {
    id: raw.id,
    content: raw.content,
    sender_profile_id: raw.sender_profile_id,
    conversation_id: raw.conversation_id,
    created_at: raw.created_at,
    attachment_id: raw.attachment_id ?? undefined,
    attachment: raw.message_attachments
      ? {
          id: raw.message_attachments.id,
          url: raw.message_attachments.url,
          mime_type: raw.message_attachments.mime_type ?? undefined,
          conversation_id: raw.message_attachments.conversation_id,
          profile_id: raw.message_attachments.profile_id,
        }
      : undefined,
  };
}


export const useGlobalMessageListener = (currentUserId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("global-message-listener")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "social",
          table: "messages",
        },
        (payload) => {
          const message = payload.new;

          if (message.sender_profile_id === currentUserId) return;

          // Play notification sound
          playBeep();

          // Show native browser notification
          if (Notification.permission === "granted") {
            new Notification("New message", {
              body: message.content?.slice(0, 100) ?? "You have a new message",
            });
          }

          // Invalidate unread messages query to trigger a refetch
          queryClient.invalidateQueries({
            queryKey: messageKeyFactory({ profileId: currentUserId }).totalUnread,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, queryClient]);
};

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
    queryKey: messageKeyFactory({ conversationId, profileId }).unread ?? ["messages-unread", conversationId, profileId],
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
  return useMutation({
    mutationFn: async ({ messageIds, profileId }) => {
      const updates = messageIds.map(async (id) => {
        const { data: existingData, error: fetchError } = await supabase
          .schema("social")
          .from("messages")
          .select("read_by")
          .eq("id", id)
          .single();
        if (fetchError) throw new Error(fetchError.message);
        const currentReadBy = existingData?.read_by || [];
        if (currentReadBy.includes(profileId)) return;
        const updatedReadBy = [...currentReadBy, profileId];
        const { error } = await supabase
          .schema("social")
          .from("messages")
          .update({ read_by: updatedReadBy })
          .eq("id", id);
        if (error) throw new Error(error.message);
      });
      return Promise.all(updates);
    },
    onSettled: (_data, _error, { conversationId, profileId }) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageKeyFactory,
        entity: { conversationId, profileId },
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
    queryKey: messageKeyFactory({ conversationId }).all ?? ["messages", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select(`
          *,
          message_attachments:attachment_id (
            id,
            url,
            mime_type,
            profile_id,
            conversation_id
          )
        `)
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []).map(mapMessageFromSupabase);
    },
    enabled: !!conversationId,
  });
};

export const useInsertMessageMutation = (): UseMutationResult<Message, Error, Partial<Message>> => {
  const queryClient = useQueryClient();
  return useMutation({
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
        content: message.content ?? "",
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageKeyFactory({ conversationId: optimisticMsg.conversation_id }).all!,
        entity: optimisticMsg,
        type: "add",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
    },
    onSuccess: (newMessage) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => messageKeyFactory({ conversationId: newMessage.conversation_id }).all!,
        entity: newMessage,
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
  return useMutation({
    mutationFn: async ({ id, updatedFields }) => {
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
      const optimisticEntity: Message = {
        id,
        conversation_id,
        sender_profile_id: updatedFields.sender_profile_id ?? "",
        content: updatedFields.content ?? "",
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageKeyFactory({ conversationId: conversation_id }).all!,
        entity: optimisticEntity,
        type: "update",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
    },
    onSuccess: (newMessage) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => messageKeyFactory({ conversationId: newMessage.conversation_id }).all!,
        entity: newMessage,
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
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("social")
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, conversation_id }) => {
      const optimisticEntity: Message = {
        id,
        conversation_id,
        sender_profile_id: "",
        content: "",
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageKeyFactory({ conversationId: conversation_id }).all!,
        entity: optimisticEntity,
        type: "remove",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
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
