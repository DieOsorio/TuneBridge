import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { nestComments } from "../../components/social/comments/helpers/comments";
import { commentKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string;
  created_at: string;
  [key: string]: any;
}

// FETCH COMMENTS FROM A SPECIFIC POST
export const useFetchCommentsQuery = (postId: string): UseQueryResult<Comment[], Error> => {
  return useQuery<Comment[], Error>({
    queryKey: commentKeyFactory({ postId }).all ?? ["comments", postId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return nestComments(data ?? []);
    },
    enabled: !!postId,
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// INSERT NEW COMMENT
export const useInsertCommentMutation = (): UseMutationResult<Comment, Error, Partial<Comment>> => {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, Partial<Comment>>({
    mutationFn: async (comment) => {
      const { data, error } = await supabase
        .schema("social")
        .from("comments")
        .insert(comment)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Comment;
    },
    onMutate: async (comment) => {
      const optimisticComment: Comment = {
        ...comment,
        id: comment.id ?? `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        post_id: comment.post_id,
      } as Comment;
      return optimisticUpdate({
        queryClient,
        entity: optimisticComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
        type: "add",
      });
    },
    onSuccess: (newComment, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: {
          ...variables,
          post_id: variables.post_id ?? "",
          id: variables.id ?? "",
          created_at: variables.created_at ?? "",
        },
        newEntity: newComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          ...variables,
          post_id: variables.post_id ?? "",
          id: variables.id ?? "",
          created_at: variables.created_at ?? "",
        },
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
      });
    },
  });
};

// UPDATE COMMENT
export const useUpdateCommentMutation = (): UseMutationResult<Comment, Error, { id: string; updatedComment: Partial<Comment>; post_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, { id: string; updatedComment: Partial<Comment>; post_id: string }>({
    mutationFn: async ({ id, updatedComment }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("comments")
        .update(updatedComment)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Comment;
    },
    onMutate: async ({ id, updatedComment, post_id }) => {
      const optimisticComment: Comment = {
        id,
        ...updatedComment,
        post_id,
      } as Comment;
      return optimisticUpdate({
        queryClient,
        entity: optimisticComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
        type: "update",
      });
    },
    onSuccess: (newComment, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: {
          id: variables.id,
          post_id: variables.post_id ?? "",
          created_at: variables.updatedComment.created_at ?? "",
          parent_id: variables.updatedComment.parent_id,
          ...variables.updatedComment,
        },
        newEntity: newComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          id: variables.id,
          post_id: variables.post_id ?? "",
          created_at: variables.updatedComment.created_at ?? "",
          parent_id: variables.updatedComment.parent_id,
          ...variables.updatedComment,
        },
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
      });
    },
  });
};

// DELETE COMMENT
export const useDeleteCommentMutation = (): UseMutationResult<void, Error, Comment> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Comment>({
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
        entity: { id: comment.id, post_id: comment.post_id } as Comment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: { id: variables.id, post_id: variables.post_id } as Comment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all ?? ["comments", entity.post_id ?? ""],
      });
    },
  });
};
