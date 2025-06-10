import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { singerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch all singer details for a given roleId
export const useFetchSingersQuery = (roleId) => {
  return useQuery({
    queryKey: singerDetailsKeyFactory({ roleId }).all,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch single singer detail by id
export const useFetchSingerById = (id) => {
  return useQuery({
    queryKey: singerDetailsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new singer
export const useAddSingerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
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
    onSuccess: (newSinger, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          roleId: variables.role_id || variables.roleId,
        },
        newEntity: newSinger,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: { roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Update singer
export const useUpdateSingerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
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
    onSuccess: (newSinger, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: { id: variables.id },
        newEntity: newSinger,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: { id: variables.id, roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Delete singer
export const useDeleteSingerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("singer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
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
        keyFactory: singerDetailsKeyFactory,
        entity: { roleId: variables.roleId },
      });
    },
  });
};
