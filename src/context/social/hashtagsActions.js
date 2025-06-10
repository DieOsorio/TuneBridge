import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { hashtagKeyFactory } from "../helpers/social/socialKeys";

import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch all hashtags
export const useFetchHashtagsQuery = () => {
  return useQuery({
    queryKey: hashtagKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("hashtags")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// Upsert hashtag
export const useUpsertHashtagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("hashtags")
        .upsert(hashtag, { onConflict: "name" })
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (newHashtag) => {
      return optimisticUpdate({
        queryClient,
        queryKey: hashtagKeyFactory().all,
        entity: newHashtag,
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newHashtag, variables) => {
      replaceOptimisticItem({
        queryClient,
        queryKey: hashtagKeyFactory().all,
        optimisticEntity: variables,
        realEntity: newHashtag,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: hashtagKeyFactory().all,
      });
    }
  });
};

// Delete hashtag (optional)
export const useDeleteHashtagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("social")
        .from("hashtags")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      return optimisticUpdate({
        queryClient,
        queryKey: hashtagKeyFactory().all,
        entity: { id },
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
        queryKey: hashtagKeyFactory().all,
      });
    }
  });
};
