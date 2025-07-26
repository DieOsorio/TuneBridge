import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { postHashtagKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface PostHashtag {
  post_id: string;
  hashtag_id: string;
  hashtags?: { name: string };
  [key: string]: any;
}

export const useFetchPostHashtagsQuery = (postId: string): UseQueryResult<PostHashtag[], Error> => {
  return useQuery<PostHashtag[], Error>({
    queryKey: postHashtagKeyFactory({ postId }).all ?? ["postHashtags", postId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .select("post_id, hashtag_id, hashtags(name)")
        .eq("post_id", postId);
      if (error) throw new Error(error.message);
      // Map each item to ensure hashtags is { name: string }
      return Array.isArray(data)
        ? data.map((item: any) => ({
            post_id: item.post_id ?? "",
            hashtag_id: item.hashtag_id ?? "",
            hashtags: item.hashtags && Array.isArray(item.hashtags) && item.hashtags[0]
              ? { name: String(item.hashtags[0].name ?? "") }
              : { name: "" },
          }))
        : [];
    },
    enabled: !!postId,
  });
};

export const useUpsertPostHashtagMutation = (): UseMutationResult<PostHashtag, Error, Partial<PostHashtag>> => {
  const queryClient = useQueryClient();
  return useMutation<PostHashtag, Error, Partial<PostHashtag>>({
    mutationFn: async (postHashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .upsert(postHashtag)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as PostHashtag;
    },
    onMutate: async (postHashtag) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: PostHashtag) => postHashtagKeyFactory({ postId: entity.post_id }) ?? { all: ["postHashtags", entity.post_id ?? ""] },
        entity: { post_id: postHashtag.post_id ?? "", hashtag_id: postHashtag.hashtag_id ?? "" },
        type: "add",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSuccess: (newPostHashtag, variables) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: PostHashtag) => postHashtagKeyFactory({ postId: entity.post_id }) ?? { all: ["postHashtags", entity.post_id ?? ""] },
        entity: { post_id: variables.post_id ?? "", hashtag_id: variables.hashtag_id ?? "" },
        newEntity: newPostHashtag,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: PostHashtag) => postHashtagKeyFactory({ postId: entity.post_id }) ?? { all: ["postHashtags", entity.post_id ?? ""] },
        entity: { post_id: variables.post_id ?? "", hashtag_id: variables.hashtag_id ?? "" },
      }),
  });
};

export const useDeletePostHashtagMutation = (): UseMutationResult<void, Error, { post_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { post_id: string }>({
    mutationFn: async ({ post_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("post_hashtags")
        .delete()
        .eq("post_id", post_id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ post_id }) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: PostHashtag) => postHashtagKeyFactory({ postId: entity.post_id }) ?? { all: ["postHashtags", entity.post_id ?? ""] },
        entity: { post_id: post_id ?? "", hashtag_id: "" },
        type: "remove",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: PostHashtag) => postHashtagKeyFactory({ postId: entity.post_id }) ?? { all: ["postHashtags", entity.post_id ?? ""] },
        entity: { post_id: variables.post_id ?? "", hashtag_id: "" },
      }),
  });
};
