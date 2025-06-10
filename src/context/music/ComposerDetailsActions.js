import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { composerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch all composer details for a given roleId
export const useFetchComposersQuery = (roleId) => {
  return useQuery({
    queryKey: composerDetailsKeyFactory({ roleId }).all,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch single composer detail by id
export const useFetchComposerById = (id) => {
  return useQuery({
    queryKey: composerDetailsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new composer
export const useAddComposerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          ...details,
          created_at: new Date().toISOString(),
          roleId: details.role_id,
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
    onSuccess: (newComposer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          roleId: variables.role_id || variables.roleId,
        },
        newEntity: newComposer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Update composer
export const useUpdateComposerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id, ...details },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newComposer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id: variables.id },
        newEntity: newComposer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id: variables.id, roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Delete composer
export const useDeleteComposerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("composer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id, roleId },
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
        keyFactory: composerDetailsKeyFactory,
        entity: { roleId: variables.roleId },
      });
    },
  });
};
