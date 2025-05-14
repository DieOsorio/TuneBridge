import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH LIKES FOR A COMMENT
export const useCommentLikesQuery = (comment_id) => {
  return useQuery({
    queryKey: ["commentLikes", comment_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("comment_id", comment_id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!comment_id,
  });
};

// FETCH ALL LIKES
export const useFetchLikesQuery = () => {
  return useQuery({
    queryKey: ["likes"],
    queryFn: async() => {
      const {data, error}= await supabase
      .schema("social")
      .from("likes")
      .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    }
  })
}

// FETCH USER LIKES
export const useUserLikesQuery = (profile_id) => {
  return useQuery({
    queryKey: ["userLikes", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("profile_id", profile_id);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profile_id
  });
}


// INSERT NEW LIKE
export const useInsertLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(like) => {
      const { data, error} = await supabase
      .schema("social")
      .from("likes")
      .insert(like)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async (like) => {
      await queryClient.cancelQueries({ queryKey: ["likes"] });
      await queryClient.cancelQueries({ queryKey: ["commentLikes", like.comment_id] });

      const previousLikes = queryClient.getQueryData(["likes"]);
      const previousCommentLikes = queryClient.getQueryData(["commentLikes", like.comment_id]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...like,
        created_at: new Date().toISOString(),
      };

      // Update all likes
      queryClient.setQueryData(["likes"], (old = []) => [...old, optimisticData]);
      // Update comment likes
      queryClient.setQueryData(["commentLikes", like.comment_id], (old = []) => [...old, optimisticData]);

      return { previousLikes, previousCommentLikes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["likes"], context.previousLikes);
      }
      if (context?.previousCommentLikes) {
        queryClient.setQueryData(["commentLikes", _variables.comment_id], context.previousCommentLikes);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["commentLikes", variables.comment_id] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.profile_id] });
    }
  })
}

// UPDATE LIKE
export const useUpdateLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedLike }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .update(updatedLike)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // optimistic update
    onMutate: async ({ id, updatedLike }) => {
      await queryClient.cancelQueries({ queryKey: ["likes"] });
      await queryClient.cancelQueries({ queryKey: ["commentLikes", updatedLike.comment_id] });

      const previousLikes = queryClient.getQueryData(["likes"]);
      const previousCommentLikes = queryClient.getQueryData(["commentLikes", updatedLike.comment_id]);

      // Update all likes
      queryClient.setQueryData(["likes"], (old = []) =>
        old.map((l) =>
          l.id === id
            ? { ...l, ...updatedLike }
            : l
        )
      );
      // Update comment likes
      queryClient.setQueryData(["commentLikes", updatedLike.comment_id], (old = []) =>
        old.map((l) =>
          l.id === id
            ? { ...l, ...updatedLike }
            : l
        )
      );

      return { previousLikes, previousCommentLikes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["likes"], context.previousLikes);
      }
      if (context?.previousCommentLikes) {
        queryClient.setQueryData(["commentLikes", _variables.updatedLike.comment_id], context.previousCommentLikes);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["commentLikes", variables.updatedLike.comment_id] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.updatedLike.profile_id] });
    },
  });
}

// DELETE LIKE
export const useDeleteLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (like) => {
      const { error } = await supabase
        .schema("social")
        .from("likes")
        .delete()
        .eq("id", like.id);

      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async (like) => {
      await queryClient.cancelQueries({ queryKey: ["likes"] });
      await queryClient.cancelQueries({ queryKey: ["commentLikes", like.comment_id] });

      const previousLikes = queryClient.getQueryData(["likes"]);
      const previousCommentLikes = queryClient.getQueryData(["commentLikes", like.comment_id]);

      queryClient.setQueryData(["likes"], (old = []) =>
        old.filter((l) => l.id !== like.id)
      );
      queryClient.setQueryData(["commentLikes", like.comment_id], (old = []) =>
        old.filter((l) => l.id !== like.id)
      );

      return { previousLikes, previousCommentLikes };
    },

    onError: (err, _variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["likes"], context.previousLikes);
      }
      if (context?.previousCommentLikes) {
        queryClient.setQueryData(["commentLikes", _variables.comment_id], context.previousCommentLikes);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["commentLikes", variables.comment_id] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.profile_id] });
    },
  });
}