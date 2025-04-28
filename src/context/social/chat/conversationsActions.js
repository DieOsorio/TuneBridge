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
  
      const { data: conversationData, error: error3 } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .eq("id", sharedId)
        .single();
  
      if (error3) throw new Error(error3.message);
  
      return conversationData;
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
      // Get conversation_ids
      const { data: conversationParticipants, error: participantError } = await supabase
        .schema("social")
        .from("conversation_participants")
        .select("conversation_id")
        .eq("profile_id", profileId);

      if (participantError) {
        throw new Error(participantError.message);
      }

      // Check if conversationParticipants is an array
      if (!Array.isArray(conversationParticipants)) {
        throw new Error("conversation_ids isn't an array");
      }

      // obtein conversation_ids
      const conversationIds = conversationParticipants.map(participant => participant.conversation_id);

      // obtein conversations
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!profileId,
  });
};



// CREATE NEW CONVERSATION
export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(conversation) => {
      const { data, error}= await supabase
      .schema("social")
      .from("conversations")
      .insert(conversation)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ( conversation ) => {
      await queryClient.cancelQueries({queryKey: ["conversations"]});

      const previousDetails = queryClient.getQueryData(["conversations"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...conversation,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["conversations"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["conversations"], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations", variables.profile_id]});
    }
  })
};

// UPDATE CONVERSATION (e.g. title, avatar_url)
export const useUpdateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("conversations")
        .update(updates)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// DELETE CONVERSATION
export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("social")
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
