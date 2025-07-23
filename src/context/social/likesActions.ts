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
  profile_id: string;
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
      const { data, error } = await supabase.schema("social").from("likes").select("*");
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
export const useUserLikedPostQuery = (
  post_id: string,
  profile_id: string
): UseQueryResult<Like | null, Error> => {
  return useQuery<Like | null, Error>({
    queryKey: likeKeyFactory({ postId: post_id, profileId: profile_id }).userPost ?? ["userLikedPost", post_id, profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("post_id", post_id)
        .eq("profile_id", profile_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? (data as Like) : null;
    },
    enabled: !!post_id && !!profile_id,
  });
};

// INSERT LIKE
export const useInsertLikeMutation = (): UseMutationResult<Like, Error, Partial<Like>> => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (like) => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .insert(like)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async (like) => {
      const optimisticLike: Like = {
        id: like.id ?? `temp-${Date.now()}`,
        profile_id: like.profile_id ?? "",
        comment_id: like.comment_id ?? undefined,
        post_id: like.post_id ?? undefined,
      };
      return optimisticUpdate({
        queryClient,
        entity: optimisticLike,
        keyFactory: () => likeKeyFactory({
          commentId: optimisticLike.comment_id,
          profileId: optimisticLike.profile_id,
          postId: optimisticLike.post_id,
        }),
        type: "add",
      });
    },
    onSuccess: (newLike, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: {
          id: variables.id ?? `temp-${Date.now()}`,
          profile_id: variables.profile_id ?? "",
          comment_id: variables.comment_id ?? null,
          post_id: variables.post_id ?? null,
        },
        newEntity: newLike,
        keyFactory: () => likeKeyFactory({
          commentId: newLike.comment_id,
          profileId: newLike.profile_id,
          postId: newLike.post_id,
        }),
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context as Record<string, unknown> });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: {
          id: variables.id ?? `temp-${Date.now()}`,
          profile_id: variables.profile_id ?? "",
          comment_id: variables.comment_id ?? null,
          post_id: variables.post_id ?? null,
        },
        keyFactory: () => likeKeyFactory({
          commentId: variables.comment_id,
          profileId: variables.profile_id,
          postId: variables.post_id,
        }),
      });
    },
  });
};

// DELETE LIKE
export const useDeleteLikeMutation = (): UseMutationResult<void, Error, Like> => {
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
        entity: {
          id: like.id,
          profile_id: like.profile_id,
          comment_id: like.comment_id ?? null,
          post_id: like.post_id ?? null,
        },
        keyFactory: () => likeKeyFactory({
          commentId: like.comment_id,
          profileId: like.profile_id,
          postId: like.post_id,
        }),
        type: "remove",
      });
    },
    onError: (_err, _vars, context) => {
      rollbackCache({ queryClient, previousData: context as Record<string, unknown> });
    },
    onSettled: (_data, _error, like) => {
      invalidateKeys({
        queryClient,
        entity: {
          id: like.id,
          profile_id: like.profile_id,
          comment_id: like.comment_id ?? null,
          post_id: like.post_id ?? null,
        },
        keyFactory: () => likeKeyFactory({
          commentId: like.comment_id,
          profileId: like.profile_id,
          postId: like.post_id,
        }),
      });
    },
  });
};
