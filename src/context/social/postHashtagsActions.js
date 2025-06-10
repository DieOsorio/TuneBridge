import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { postHashtagKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch hashtags for a specific post
export const useFetchPostHashtagsQuery = (postId) => {
  return useQuery({
    queryKey: postHashtagKeyFactory({ postId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .select("post_id, hashtag_id, hashtags(name)")
        .eq("post_id", postId);
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!postId,
  });
};

// Upsert post_hashtag
export const useUpsertPostHashtagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postHashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .upsert(postHashtag)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (postHashtag) => {
      return optimisticUpdate({
        queryClient,
        queryKey: postHashtagKeyFactory({ postId: postHashtag.post_id }).all,
        entity: { postId: postHashtag.post_id, ...postHashtag },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newPostHashtag, variables) => {
      replaceOptimisticItem({
        queryClient,
        queryKey: postHashtagKeyFactory({ postId: variables.post_id }).all,
        optimisticEntity: variables,
        realEntity: newPostHashtag,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: postHashtagKeyFactory({ postId: variables.post_id }).all,
      });
    },
  });
};

// Delete post_hashtag by ID
export const useDeletePostHashtagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ post_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .delete()
        .eq("post_id", post_id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ post_id }) => {
      return optimisticUpdate({
        queryClient,
        queryKey: postHashtagKeyFactory({ postId: post_id }).all,
        entity: { postId: post_id },
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
        queryKey: postHashtagKeyFactory({ postId: variables.post_id }).all,
      });
    },
  });
};
