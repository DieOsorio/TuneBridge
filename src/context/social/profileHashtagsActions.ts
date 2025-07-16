import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { profileHashtagKeyFactory } from "../helpers/social/socialKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface ProfileHashtag {
  profile_id: string;
  hashtag_id: string;
  hashtags?: { name: string };
  [key: string]: any;
}

export const useFetchProfileHashtagsQuery = (profileId: string): UseQueryResult<ProfileHashtag[], Error> => {
  return useQuery<ProfileHashtag[], Error>({
    queryKey: profileHashtagKeyFactory({ profileId }).all ?? ["profileHashtags", profileId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .select("profile_id, hashtag_id, hashtags(name)")
        .eq("profile_id", profileId);
      if (error) throw new Error(error.message);
      // Map each item to ensure hashtags is { name: string }
      return Array.isArray(data)
        ? data.map((item: any) => ({
            profile_id: item.profile_id ?? "",
            hashtag_id: item.hashtag_id ?? "",
            hashtags: item.hashtags && Array.isArray(item.hashtags) && item.hashtags[0]
              ? { name: String(item.hashtags[0].name ?? "") }
              : { name: "" },
          }))
        : [];
    },
    enabled: !!profileId,
  });
};

export const useUpsertProfileHashtagMutation = (): UseMutationResult<ProfileHashtag, Error, Partial<ProfileHashtag>> => {
  const queryClient = useQueryClient();
  return useMutation<ProfileHashtag, Error, Partial<ProfileHashtag>>({
    mutationFn: async (profileHashtag) => {
      const { data, error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .upsert(profileHashtag)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ProfileHashtag;
    },
    onMutate: async (profileHashtag) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: ProfileHashtag) => profileHashtagKeyFactory({ profileId: entity.profile_id }) ?? { all: ["profileHashtags", entity.profile_id ?? ""] },
        entity: { profile_id: profileHashtag.profile_id ?? "", hashtag_id: profileHashtag.hashtag_id ?? "" },
        type: "add",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSuccess: (newProfileHashtag, variables) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: ProfileHashtag) => profileHashtagKeyFactory({ profileId: entity.profile_id }) ?? { all: ["profileHashtags", entity.profile_id ?? ""] },
        entity: { profile_id: variables.profile_id ?? "", hashtag_id: variables.hashtag_id ?? "" },
        newEntity: newProfileHashtag,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: ProfileHashtag) => profileHashtagKeyFactory({ profileId: entity.profile_id }) ?? { all: ["profileHashtags", entity.profile_id ?? ""] },
        entity: { profile_id: variables.profile_id ?? "", hashtag_id: variables.hashtag_id ?? "" },
      }),
  });
};

export const useDeleteProfileHashtagMutation = (): UseMutationResult<void, Error, { profile_id: string; hashtag_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { profile_id: string; hashtag_id: string }>({
    mutationFn: async ({ profile_id, hashtag_id }) => {
      const { error } = await supabase
        .schema("social")
        .from("profile_hashtags")
        .delete()
        .match({ profile_id, hashtag_id });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ profile_id, hashtag_id }) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: ProfileHashtag) => profileHashtagKeyFactory({ profileId: entity.profile_id }) ?? { all: ["profileHashtags", entity.profile_id ?? ""] },
        entity: { profile_id: profile_id ?? "", hashtag_id: hashtag_id ?? "" },
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
        keyFactory: (entity: ProfileHashtag) => profileHashtagKeyFactory({ profileId: entity.profile_id }) ?? { all: ["profileHashtags", entity.profile_id ?? ""] },
        entity: { profile_id: variables.profile_id ?? "", hashtag_id: variables.hashtag_id ?? "" },
      }),
  });
};
