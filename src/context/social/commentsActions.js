import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH COMMENTS FROM A SPECIFIC POST
export const useFetchCommentsQuery = (postId) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async() => {
      const {data, error}= await supabase
      .schema("social")
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!postId
  })
}


// INSERT NEW COMMENT
export const useInsertCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async( comment ) => {
      const { data, error} = await supabase
      .schema("social")
      .from("comments")
      .insert(comment)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ( comment ) => {
      await queryClient.cancelQueries({queryKey: ["comments"]});

      const previousDetails = queryClient.getQueryData(["comments"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...comment,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["comments"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["comments"], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
    }
  })
}

// UPDATE COMMENT
export const useUpdateCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updatedComment}) => {
      console.log("ID of the comment", id);
      console.log("updated comment", updatedComment);
      
      const { data, error } = await supabase
      .schema("social")
      .from("comments")
      .update(updatedComment)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, updatedComment, post_id }) => {
      await queryClient.cancelQueries({ queryKey: ["comments", post_id] });

      const previousDetails = queryClient.getQueryData(["comments", post_id]);

      queryClient.setQueryData(["comments", post_id], (old = []) =>
        old.map((c) =>
          c.id === id
            ? { ...c, ...updatedComment }
            : c
        )
      );

      return { previousDetails, post_id };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["comments", context.post_id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.post_id] });
    },
  })
}

// DELETE COMMENT
export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ( comment ) => {
      const { error } = await supabase
        .schema("social")
        .from("comments")
        .delete()
        .eq("id", comment.id);
      
      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ( comment ) => {
      await queryClient.cancelQueries({ queryKey: ["comments", comment.post_id] });

      const previousDetails = queryClient.getQueryData(["comments", comment.post_id]);

      queryClient.setQueryData(["comments", comment.post_id], (old = []) =>
        old.filter((c) => c.id !== comment.id)
      );

      return { previousDetails, post_id: comment.post_id };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["comments", context.post_id], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables, context) => {
      if (context?.post_id)
      queryClient.invalidateQueries({ queryKey: ["comments", context.post_id] });
    },
  })
} 