import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { mediaLinksKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// FETCH MEDIA BY ID
export const useMediaLink = (id) => {
  return useQuery({
    queryKey: mediaLinksKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .select()
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// FETCH MEDIA LINKS BY PROFILE
export const useUserMediaLinksQuery = (profile_id) => {
  return useQuery({
    queryKey: mediaLinksKeyFactory({ profileId: profile_id }).all,
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
      return optimisticUpdate({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          ...link,
          created_at: new Date().toISOString(),
          profileId: link.profile_id,
        },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newLink, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          profileId: variables.profile_id || variables.profileId,
        },
        newEntity: newLink,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: { profileId: variables.profile_id || variables.profileId },
      });
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
      return optimisticUpdate({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: { id, ...updatedLink, profileId: updatedLink.profile_id },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newLink, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: { id: variables.id, profileId: variables.updatedLink.profile_id },
        newEntity: newLink,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: { profileId: variables.updatedLink.profile_id },
      });
    },
  });
};

// DELETE MEDIA LINK
export const useDeleteMediaLinkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profile_id, id }) => {
      const { error } = await supabase
        .schema("music")
        .from("user_media_links")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, profile_id }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: mediaLinksKeyFactory,
        entity: { id, profileId: profile_id },
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
        keyFactory: mediaLinksKeyFactory,
        entity: { profileId: variables.profile_id },
      });
    },
  });
};
