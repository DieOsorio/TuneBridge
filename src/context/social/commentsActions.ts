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
  profile_id: string;
  parent_id?: string | null;
  content: string;
  updated_at?: string | null;
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
        id: comment.id ?? `temp-${Date.now()}`,
        post_id: comment.post_id!,
        profile_id: comment.profile_id!,
        content: comment.content ?? "",
        parent_id: comment.parent_id ?? null,
        updated_at: comment.updated_at ?? null,
        created_at: new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        entity: optimisticComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
        type: "add",
      });
    },
    onSuccess: (newComment, _variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: newComment,
        newEntity: newComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, variables) => {
      if (!variables.post_id || !variables.profile_id) return;
      const fallback: Comment = {
        id: variables.id ?? "",
        post_id: variables.post_id,
        profile_id: variables.profile_id,
        content: variables.content ?? "",
        parent_id: variables.parent_id ?? null,
        updated_at: variables.updated_at ?? null,
        created_at: variables.created_at ?? new Date().toISOString(),
      };
      invalidateKeys({
        queryClient,
        entity: fallback,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
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
        post_id,
        profile_id: updatedComment.profile_id ?? "",
        content: updatedComment.content ?? "",
        parent_id: updatedComment.parent_id ?? null,
        updated_at: updatedComment.updated_at ?? null,
        created_at: updatedComment.created_at ?? new Date().toISOString(),
      };
      return optimisticUpdate({
        queryClient,
        entity: optimisticComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
        type: "update",
      });
    },
    onSuccess: (newComment) => {
      replaceOptimisticItem({
        queryClient,
        entity: newComment,
        newEntity: newComment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, variables) => {
      const { id, post_id, updatedComment } = variables;
      const fallback: Comment = {
        id,
        post_id,
        profile_id: updatedComment.profile_id ?? "",
        content: updatedComment.content ?? "",
        parent_id: updatedComment.parent_id ?? null,
        updated_at: updatedComment.updated_at ?? null,
        created_at: updatedComment.created_at ?? new Date().toISOString(),
      };
      invalidateKeys({
        queryClient,
        entity: fallback,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
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
        entity: comment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, comment) => {
      invalidateKeys({
        queryClient,
        entity: comment,
        keyFactory: (entity: Comment) => commentKeyFactory({ postId: entity.post_id }).all!,
      });
    },
  });
};
