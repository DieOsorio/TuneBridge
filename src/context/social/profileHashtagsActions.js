import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Fetch hashtags for a specific profile
export const useFetchProfileHashtagsQuery = (profileId) => {
  return useQuery({
    queryKey: ["profileHashtags", profileId],
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profileHashtags", variables.profile_id] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profileHashtags", variables.profile_id] });
    },
  });
};
