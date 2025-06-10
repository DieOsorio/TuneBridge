import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { nestComments } from "../../components/social/comments/helpers/comments";
import { commentKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

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
      return nestComments(data);
    },
    enabled: !!postId
  })
}


// INSERT NEW COMMENT
export const useInsertCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment) => {
      const { data, error } = await supabase
        .schema("social")
        .from("comments")
        .insert(comment)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (comment) => {
      // Add temp id and created_at for optimistic UI
      const optimisticComment = {
        ...comment,
        id: comment.id ?? `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        postId: comment.post_id,
      };
      return optimisticUpdate({
        queryClient,
        entity: optimisticComment,
        keyFactory: commentKeyFactory,
        type: "add",
      });
    },
    onSuccess: (newComment, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: {
          ...variables,
          postId: variables.post_id,
        },
        newEntity: newComment,
        keyFactory: commentKeyFactory,
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          ...variables,
          postId: variables.post_id,
        },
        keyFactory: commentKeyFactory,
      });
    },
  });
};

// UPDATE COMMENT
export const useUpdateCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedComment }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("comments")
        .update(updatedComment)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, updatedComment, post_id }) => {
      return optimisticUpdate({
        queryClient,
        entity: {
          id,
          ...updatedComment,
          postId: post_id,
        },
        keyFactory: commentKeyFactory,
        type: "update",
      });
    },
    onSuccess: (newComment, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: {
          id: variables.id,
          ...variables.updatedComment,
          postId: variables.post_id,
        },
        newEntity: newComment,
        keyFactory: commentKeyFactory,
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          id: variables.id,
          ...variables.updatedComment,
          postId: variables.post_id,
        },
        keyFactory: commentKeyFactory,
      });
    },
  });
};

// DELETE COMMENT
export const useDeleteCommentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment) => {
      const { error } = await supabase
        .schema("social")
        .from("comments")
        .delete()
        .eq("id", comment.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (comment) => {
      return optimisticUpdate({
        queryClient,
        entity: {
          id: comment.id,
          postId: comment.post_id,
        },
        keyFactory: commentKeyFactory,
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          id: variables.id,
          postId: variables.post_id,
        },
        keyFactory: commentKeyFactory,
      });
    },
  });
};