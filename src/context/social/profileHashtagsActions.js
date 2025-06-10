import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { profileHashtagKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch hashtags for a specific profile
export const useFetchProfileHashtagsQuery = (profileId) => {
  return useQuery({
    queryKey: profileHashtagKeyFactory({ profileId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .select("profile_id, hashtag_id, hashtags(name)")
        .eq("profile_id", profileId);
      
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId,
  });
};

// Upsert profile_hashtag
export const useUpsertProfileHashtagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileHashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .upsert(profileHashtag)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (profileHashtag) => {
      return optimisticUpdate({
        queryClient,
        queryKey: profileHashtagKeyFactory({ profileId: profileHashtag.profile_id }).all,
        entity: { profileId: profileHashtag.profile_id, ...profileHashtag },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newProfileHashtag, variables) => {
      replaceOptimisticItem({
        queryClient,
        queryKey: profileHashtagKeyFactory({ profileId: variables.profile_id }).all,
        optimisticEntity: variables,
        realEntity: newProfileHashtag,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: profileHashtagKeyFactory({ profileId: variables.profile_id }).all,
      });
    },
  });
};

// Delete profile_hashtag by profile_id and hashtag_id
export const useDeleteProfileHashtagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profile_id, hashtag_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .delete()
        .match({ profile_id, hashtag_id });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ profile_id, hashtag_id }) => {
      return optimisticUpdate({
        queryClient,
        queryKey: profileHashtagKeyFactory({ profileId: profile_id }).all,
        entity: { profileId: profile_id, hashtagId: hashtag_id },
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
        queryKey: profileHashtagKeyFactory({ profileId: variables.profile_id }).all,
      });
    },
  });
};
