import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { mediaLinksKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface MediaLink {
  id: string;
  profile_id: string;
  created_at?: string;
  [key: string]: any;
}

export interface AddMediaLinkParams extends Partial<MediaLink> {}
export interface UpdateMediaLinkParams {
  id: string;
  updatedLink: Partial<MediaLink>;
}
export interface DeleteMediaLinkParams {
  id: string;
  profile_id: string;
}

// Helper to adapt mediaLinksKeyFactory for cache helpers
const mediaLinkEntityKeyFactory = (entity: MediaLink) => {
  return mediaLinksKeyFactory({
    profileId: entity.profile_id,
    id: entity.id,
  });
};

export const useMediaLink = (id: string): UseQueryResult<MediaLink, Error> => {
  return useQuery<MediaLink, Error>({
    queryKey: mediaLinksKeyFactory({ id }).single ?? ["mediaLink", id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .select()
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as MediaLink;
    },
    enabled: !!id,
  });
};

export const useUserMediaLinksQuery = (profile_id: string): UseQueryResult<MediaLink[], Error> => {
  return useQuery<MediaLink[], Error>({
    queryKey: mediaLinksKeyFactory({ profileId: profile_id }).all ?? ["userMediaLinks", profile_id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as MediaLink[];
    },
    enabled: !!profile_id,
  });
};

export const useInsertMediaLinkMutation = (): UseMutationResult<MediaLink, Error, AddMediaLinkParams> => {
  const queryClient = useQueryClient();
  return useMutation<MediaLink, Error, AddMediaLinkParams>({
    mutationFn: async (link) => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .insert(link)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as MediaLink;
    },
    onMutate: async (link) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          ...link,
          created_at: new Date().toISOString(),
          profile_id: link.profile_id ?? "",
        },
        type: "add",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newLink, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          profile_id: variables.profile_id ?? variables.profileId ?? "",
        },
        newEntity: newLink,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id: "", profile_id: variables.profile_id ?? variables.profileId ?? "" },
      });
    },
  });
};

export const useUpdateMediaLinkMutation = (): UseMutationResult<MediaLink, Error, UpdateMediaLinkParams> => {
  const queryClient = useQueryClient();
  return useMutation<MediaLink, Error, UpdateMediaLinkParams>({
    mutationFn: async ({ id, updatedLink }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("user_media_links")
        .update(updatedLink)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as MediaLink;
    },
    onMutate: async ({ id, updatedLink }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id, ...updatedLink, profile_id: updatedLink.profile_id ?? "" },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newLink, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id: variables.id, profile_id: variables.updatedLink.profile_id ?? "" },
        newEntity: newLink,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id: "", profile_id: variables.updatedLink.profile_id ?? "" },
      });
    },
  });
};

export const useDeleteMediaLinkMutation = (): UseMutationResult<void, Error, DeleteMediaLinkParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteMediaLinkParams>({
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
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id, profile_id: profile_id ?? "" },
        type: "remove",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: mediaLinkEntityKeyFactory,
        entity: { id: "", profile_id: variables.profile_id ?? "" },
      });
    },
  });
};
