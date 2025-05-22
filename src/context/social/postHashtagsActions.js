import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Fetch hashtags for a specific post
export const useFetchPostHashtagsQuery = (postId) => {
  return useQuery({
    queryKey: ["postHashtags", postId],
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["postHashtags", variables.post_id] });
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
      console.log("Deleting post_hashtag", post_id);
      

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["postHashtags", variables.post_id] });
    },
  });
};
