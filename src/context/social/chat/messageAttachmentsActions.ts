import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "@/supabase";
import { messageAttachmentKeyFactory } from "../../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../../helpers/cacheHandler";

export interface MessageAttachment {
  id: string;
  conversation_id: string;
  message_id?: string;
  url?: string;
  mime_type: string;
  created_at?: string;
  profile_id: string;
  [key: string]: any;
}

export const useFetchMessageAttachmentsQuery = (
  messageId: string
): UseQueryResult<MessageAttachment[], Error> => {
  return useQuery<MessageAttachment[], Error>({
    queryKey: messageAttachmentKeyFactory({ messageId }).all ?? ["messageAttachments", messageId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("message_attachments")
        .select("*")
        .eq("message_id", messageId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return data as MessageAttachment[];
    },
    enabled: !!messageId,
  });
};

export interface InsertMessageAttachmentParams extends Partial<MessageAttachment> {}

export const useInsertMessageAttachmentMutation = (): UseMutationResult<
  MessageAttachment,
  Error,
  InsertMessageAttachmentParams
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachment) => {
      const { data, error } = await supabase
        .schema("social")
        .from("message_attachments")
        .insert(attachment)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as MessageAttachment;
    },
    onMutate: async (attachment) => {
      const optimisticAttachment: MessageAttachment = {
        id: attachment.id || `temp-${Date.now()}`,
        message_id: attachment.message_id ?? "",
        conversation_id: attachment.conversation_id ?? "",
        url: attachment.url ?? "",
        mime_type: attachment.mime_type ?? "unknown",
        created_at: new Date().toISOString(),
        profile_id: attachment.profile_id ?? "",
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageAttachmentKeyFactory({ messageId: optimisticAttachment.message_id }).all!,
        entity: optimisticAttachment,
        type: "add",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
    },
    onSuccess: (newAttachment) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => messageAttachmentKeyFactory({ messageId: newAttachment.message_id }).all!,
        entity: newAttachment,
        newEntity: newAttachment,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageAttachmentKeyFactory,
        entity: { messageId: variables.message_id ?? "" },
      });
    },
  });
};

export interface UpdateMessageAttachmentParams {
  id: string;
  updatedFields: Partial<MessageAttachment>;
  message_id: string;
}

export const useUpdateMessageAttachmentMutation = (): UseMutationResult<
  MessageAttachment,
  Error,
  UpdateMessageAttachmentParams
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedFields }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("message_attachments")
        .update(updatedFields)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as MessageAttachment;
    },
    onMutate: async ({ id, updatedFields, message_id }) => {
      const optimisticEntity: MessageAttachment = {
        id,
        message_id,
        conversation_id: updatedFields.conversation_id ?? "",
        url: updatedFields.url ?? "",
        mime_type: updatedFields.mime_type ?? "unknown",
        created_at: new Date().toISOString(),
        profile_id: updatedFields.profile_id ?? "",
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageAttachmentKeyFactory({ messageId: message_id }).all!,
        entity: optimisticEntity,
        type: "update",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context });
    },
    onSuccess: (updatedAttachment) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: () => messageAttachmentKeyFactory({ messageId: updatedAttachment.message_id }).all!,
        entity: updatedAttachment,
        newEntity: updatedAttachment,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: messageAttachmentKeyFactory,
        entity: { messageId: variables.message_id },
      });
    },
  });
};

export interface DeleteMessageAttachmentParams {
  id: string;
  message_id: string;
}

export const useDeleteMessageAttachmentMutation = (): UseMutationResult<
  void,
  Error,
  DeleteMessageAttachmentParams
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("social")
        .from("message_attachments")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, message_id }) => {
      const optimisticEntity: MessageAttachment = {
        id,
        message_id,
        conversation_id: "", // optional, not needed for delete cache really
        url: "",
        mime_type: "unknown",
        created_at: new Date().toISOString(),
        profile_id: "", // optional, not needed for delete cache really
      };
      return optimisticUpdate({
        queryClient,
        keyFactory: () => messageAttachmentKeyFactory({ messageId: message_id }).all!,
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
        keyFactory: messageAttachmentKeyFactory,
        entity: { messageId: variables.message_id },
      });
    },
  });
};
