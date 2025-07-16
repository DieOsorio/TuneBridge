import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { likeKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface Like {
  id: string;
  comment_id?: string;
  profile_id?: string;
  post_id?: string;
  [key: string]: any;
}

// FETCH LIKES FOR A COMMENT
export const useCommentLikesQuery = (comment_id: string): UseQueryResult<Like[], Error> => {
  const isTempId = comment_id?.toString().startsWith("temp-");
  return useQuery<Like[], Error>({
    queryKey: likeKeyFactory({ commentId: comment_id }).comment ?? ["commentLikes", comment_id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("comment_id", comment_id);
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!comment_id && !isTempId,
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// FETCH ALL LIKES
export const useFetchLikesQuery = (): UseQueryResult<Like[], Error> => {
  return useQuery<Like[], Error>({
    queryKey: likeKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*");
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// FETCH USER LIKES
export const useUserLikesQuery = (profile_id: string): UseQueryResult<Like[], Error> => {
  return useQuery<Like[], Error>({
    queryKey: likeKeyFactory({ profileId: profile_id }).user ?? ["userLikes", profile_id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("profile_id", profile_id);
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!profile_id,
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// FETCH LIKES FOR A POST
export const usePostLikesQuery = (post_id: string): UseQueryResult<Like[], Error> => {
  return useQuery<Like[], Error>({
    queryKey: likeKeyFactory({ postId: post_id }).post ?? ["postLikes", post_id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("post_id", post_id);
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!post_id,
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// CHECK IF USER LIKED A POST
export const useUserLikedPostQuery = (post_id: string, profile_id: string): UseQueryResult<Like | null, Error> => {
  return useQuery<Like | null, Error>({
    queryKey: likeKeyFactory({ postId: post_id, profileId: profile_id }).userPost ?? ["userLikedPost", post_id ?? "", profile_id ?? ""],
    queryFn: async () => {
      if (!post_id || !profile_id) return null;
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("id")
        .eq("post_id", post_id)
        .eq("profile_id", profile_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ?? null;
    },
    enabled: !!post_id && !!profile_id,
  });
};

// INSERT NEW LIKE
export const useInsertLikeMutation = (): UseMutationResult<Like, Error, Partial<Like>> => {
  const queryClient = useQueryClient();
  return useMutation<Like, Error, Partial<Like>>({
    mutationFn: async (like) => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .insert(like)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Like;
    },
    onMutate: async (like) => {
      const entity: Like = {
        ...like,
        comment_id: like.comment_id,
        profile_id: like.profile_id,
        post_id: like.post_id,
      } as Like;
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity,
        type: "add",
      });
    },
    onSuccess: (newLike, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity: {
          ...variables,
          comment_id: variables.comment_id,
          profile_id: variables.profile_id,
          post_id: variables.post_id,
        } as Like,
        newEntity: newLike,
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
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity: {
          ...variables,
          comment_id: variables.comment_id,
          profile_id: variables.profile_id,
          post_id: variables.post_id,
        } as Like,
      });
    },
  });
};

// UPDATE LIKE
export const useUpdateLikeMutation = (): UseMutationResult<Like, Error, { id: string; updatedLike: Partial<Like> }> => {
  const queryClient = useQueryClient();
  return useMutation<Like, Error, { id: string; updatedLike: Partial<Like> }>({
    mutationFn: async ({ id, updatedLike }) => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .update(updatedLike)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Like;
    },
    onMutate: async ({ id, updatedLike }) => {
      const entity: Like = {
        id,
        ...updatedLike,
        comment_id: updatedLike.comment_id,
        profile_id: updatedLike.profile_id,
        post_id: updatedLike.post_id,
      } as Like;
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity,
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSuccess: (newLike, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity: {
          id: variables.id,
          ...variables.updatedLike,
          comment_id: variables.updatedLike.comment_id,
          profile_id: variables.updatedLike.profile_id,
          post_id: variables.updatedLike.post_id,
        } as Like,
        newEntity: newLike,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity: {
          id: variables.id,
          ...variables.updatedLike,
          comment_id: variables.updatedLike.comment_id,
          profile_id: variables.updatedLike.profile_id,
          post_id: variables.updatedLike.post_id,
        } as Like,
      });
    },
  });
};

// DELETE LIKE
export const useDeleteLikeMutation = (): UseMutationResult<void, Error, Like> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Like>({
    mutationFn: async (like) => {
      const { error } = await supabase
        .schema("social")
        .from("likes")
        .delete()
        .eq("id", like.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (like) => {
      const entity: Like = {
        ...like,
        comment_id: like.comment_id,
        profile_id: like.profile_id,
        post_id: like.post_id,
      } as Like;
      return optimisticUpdate({
        queryClient,
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity,
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
        keyFactory: (entity: Like) => likeKeyFactory({
          commentId: entity.comment_id,
          profileId: entity.profile_id,
          postId: entity.post_id,
        }),
        entity: {
          ...variables,
          comment_id: variables.comment_id,
          profile_id: variables.profile_id,
          post_id: variables.post_id,
        } as Like,
      });
    },
  });
};
