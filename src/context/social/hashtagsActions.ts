import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { hashtagKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface Hashtag {
  id: string;
  name: string;
  [key: string]: any;
}

// Fetch all hashtags
export const useFetchHashtagsQuery = (): UseQueryResult<Hashtag[], Error> => {
  return useQuery<Hashtag[], Error>({
    queryKey: hashtagKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("hashtags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    select: (data) => Array.isArray(data) ? data : [],
  });
};

// Upsert hashtag
export const useUpsertHashtagMutation = (): UseMutationResult<Hashtag, Error, Partial<Hashtag>> => {
  const queryClient = useQueryClient();
  return useMutation<Hashtag, Error, Partial<Hashtag>>({
    mutationFn: async (hashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("hashtags")
        .upsert(hashtag, { onConflict: "name" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Hashtag;
    },
    onMutate: async (newHashtag) => {
      return optimisticUpdate({
        queryClient,
        entity: newHashtag,
        keyFactory: () => hashtagKeyFactory().all,
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSuccess: (newHashtag, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: variables as Hashtag,
        newEntity: newHashtag,
        keyFactory: () => hashtagKeyFactory().all,
      });
    },
    onSettled: (_data, _error, _variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => hashtagKeyFactory().all,
      });
    },
  });
};

// Delete hashtag
export const useDeleteHashtagMutation = (): UseMutationResult<void, Error, Hashtag> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Hashtag>({
    mutationFn: async (hashtag) => {
      const { error } = await supabase
        .schema("social")
        .from("hashtags")
        .delete()
        .eq("id", hashtag.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (hashtag) => {
      return optimisticUpdate({
        queryClient,
        entity: hashtag,
        keyFactory: () => hashtagKeyFactory().all,
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      });
    },
    onSettled: (_data, _error, _variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => hashtagKeyFactory().all,
      });
    },
  });
};
