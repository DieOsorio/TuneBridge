import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH MEDIA LINKS BY PROFILE
export const useUserMediaLinksQuery = (profile_id) => {
  return useQuery({
    queryKey: ["userMediaLinks", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profile_id,
  });
};

// INSERT MEDIA LINK
export const useInsertMediaLinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link) => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .insert(link)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async (link) => {
      await queryClient.cancelQueries({ queryKey: ["userMediaLinks", link.profile_id] });

      const previousLinks = queryClient.getQueryData(["userMediaLinks", link.profile_id]);

      const optimisticLink = {
        id: `temp-${Date.now()}`,
        ...link,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["userMediaLinks", link.profile_id], (old = []) => [optimisticLink, ...old]);

      return { previousLinks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["userMediaLinks", _variables.profile_id], context.previousLinks);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userMediaLinks", variables.profile_id] });
    },
  });
};

// UPDATE MEDIA LINK
export const useUpdateMediaLinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedLink }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .update(updatedLink)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ id, updatedLink }) => {
      await queryClient.cancelQueries({ queryKey: ["userMediaLinks", updatedLink.profile_id] });

      const previousLinks = queryClient.getQueryData(["userMediaLinks", updatedLink.profile_id]);

      queryClient.setQueryData(["userMediaLinks", updatedLink.profile_id], (old = []) =>
        old.map((link) => (link.id === id ? { ...link, ...updatedLink } : link))
      );

      return { previousLinks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["userMediaLinks", _variables.updatedLink.profile_id], context.previousLinks);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userMediaLinks", variables.updatedLink.profile_id] });
    },
  });
};

// DELETE MEDIA LINK
export const useDeleteMediaLinkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("user_media_links")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    onMutate: async ({ id, profile_id }) => {
      await queryClient.cancelQueries({ queryKey: ["userMediaLinks", profile_id] });

      const previousLinks = queryClient.getQueryData(["userMediaLinks", profile_id]);

      queryClient.setQueryData(["userMediaLinks", profile_id], (old = []) =>
        old.filter((link) => link.id !== id)
      );

      return { previousLinks };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["userMediaLinks", _variables.profile_id], context.previousLinks);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userMediaLinks", variables.profile_id] });
    },
  });
};
