import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../supabase";
import { useEffect } from "react";

// TOTAL UNREAD MESSAGES
export const useTotalUnreadMessages = (profileId) => {
  return useQuery({
    queryKey: ["total-unread-messages", profileId],
    queryFn: async () => {
      // 1. Obtener las conversaciones del usuario
      const { data: conversations, error: convError } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId);

      if (convError) throw new Error(convError.message);

      const conversationIds = conversations.map((c) => c.conversation_id);

      if (conversationIds.length === 0) return { total: 0, perConversation: {} };

      // 2. Buscar mensajes no leídos en esas conversaciones
      const { data: messages, error: msgError } = await supabase
        .schema("social")
        .from("messages")
        .select("id, conversation_id, sender_profile_id, read_by")
        .in("conversation_id", conversationIds)
        .is("deleted_at", null);

      if (msgError) throw new Error(msgError.message);

      const perConversation = {};

      messages.forEach((msg) => {
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


// CHECK UNREAD MESSAGES
export const useUnreadMessages = ({ conversationId, profileId }) => {
  return useQuery({
    queryKey: ["unread-messages", conversationId, profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("messages")
        .select("id, sender_profile_id, read_by")
        .eq("conversation_id", conversationId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
        
      const unread = data.filter(
        (msg) =>
          msg.sender_profile_id !== profileId &&
          (!msg.read_by || !msg.read_by.includes(profileId))
      );

      return unread;
    },
    enabled: !!conversationId && !!profileId,
  });
};


// MARK MESSAGES AS READ
export const useMarkMessagesAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
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
          console.log(`Message ${id} already read by ${profileId}`);
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

    onSettled: (_data, _error, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });
};



// REALTIME MESSAGES
export const useMessagesRealtime = (conversation_id) => {
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
          queryClient.invalidateQueries({
            queryKey: ["messages", conversation_id],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id, queryClient]);
};

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
