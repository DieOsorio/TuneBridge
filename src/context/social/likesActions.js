import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { likeKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// FETCH LIKES FOR A COMMENT
export const useCommentLikesQuery = (comment_id) => {
  const isTempId = comment_id?.toString().startsWith("temp-");
  return useQuery({
    queryKey: likeKeyFactory({ commentId: comment_id }).comment,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("comment_id", comment_id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!comment_id && !isTempId,
  });
};

// FETCH ALL LIKES
export const useFetchLikesQuery = () => {
  return useQuery({
    queryKey: likeKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*");
      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// FETCH USER LIKES
export const useUserLikesQuery = (profile_id) => {
  return useQuery({
    queryKey: likeKeyFactory({ profileId: profile_id }).user,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("profile_id", profile_id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profile_id,
  });
};

// FETCH LIKES FOR A POST
export const usePostLikesQuery = (post_id) => {
  return useQuery({
    queryKey: likeKeyFactory({ postId: post_id }).post,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("post_id", post_id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!post_id,
  });
};

// CHECK IF USER LIKED A POST
export const useUserLikedPostQuery = (post_id, profile_id) => {
  return useQuery({
    queryKey: likeKeyFactory({ postId: post_id, profileId: profile_id }).userPost,
    queryFn: async () => {
      if (!post_id || !profile_id) return false;
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("id")
        .eq("post_id", post_id)
        .eq("profile_id", profile_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!post_id && !!profile_id,
  });
};

// INSERT NEW LIKE
export const useInsertLikeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (like) => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .insert(like)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (like) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          ...like,
          commentId: like.comment_id,
          profileId: like.profile_id,
          postId: like.post_id,
        },
        type: "add",
      });
    },
    onSuccess: (newLike, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          ...variables,
          commentId: variables.comment_id,
          profileId: variables.profile_id,
          postId: variables.post_id,
        },
        newEntity: newLike,
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          ...variables,
          commentId: variables.comment_id,
          profileId: variables.profile_id,
          postId: variables.post_id,
        },
      });
    },
  });
};

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
    onMutate: async ({ id, updatedLike }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          id,
          ...updatedLike,
          commentId: updatedLike.comment_id,
          profileId: updatedLike.profile_id,
          postId: updatedLike.post_id,
        },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newLike, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          id: variables.id,
          ...variables.updatedLike,
          commentId: variables.updatedLike.comment_id,
          profileId: variables.updatedLike.profile_id,
          postId: variables.updatedLike.post_id,
        },
        newEntity: newLike,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          id: variables.id,
          ...variables.updatedLike,
          commentId: variables.updatedLike.comment_id,
          profileId: variables.updatedLike.profile_id,
          postId: variables.updatedLike.post_id,
        },
      });
    },
  });
};

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
    onMutate: async (like) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          ...like,
          commentId: like.comment_id,
          profileId: like.profile_id,
          postId: like.post_id,
        },
        type: "remove",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: likeKeyFactory,
        entity: {
          ...variables,
          commentId: variables.comment_id,
          profileId: variables.profile_id,
          postId: variables.post_id,
        },
      });
    },
  });
};