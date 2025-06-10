import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { djDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// FETCH ALL DJ DETAILS FOR A ROLE
export const useFetchDjsQuery = (roleId) => {
  return useQuery({
    queryKey: djDetailsKeyFactory({ roleId }).all,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// FETCH SINGLE DJ BY ID
export const useFetchDjById = (id) => {
  return useQuery({
    queryKey: djDetailsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// ADD NEW DJ
export const useAddDjMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: djDetailsKeyFactory,
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
    onSuccess: (newDj, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          roleId: variables.role_id || variables.roleId,
        },
        newEntity: newDj,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// UPDATE DJ
export const useUpdateDjMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: djDetailsKeyFactory,
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
    onSuccess: (newDj, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { id: variables.id },
        newEntity: newDj,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { id: variables.id, roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// DELETE DJ
export const useDeleteDjMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("dj_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: djDetailsKeyFactory,
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
        keyFactory: djDetailsKeyFactory,
        entity: { roleId: variables.roleId },
      });
    },
  });
};
