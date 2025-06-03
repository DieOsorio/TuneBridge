import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";


// Fetch all hashtags
export const useFetchHashtagsQuery = () => {
  return useQuery({
    queryKey: ["hashtags"],
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hashtags"] });
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hashtags"] });
    },
  });
};
