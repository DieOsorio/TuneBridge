import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { producerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Fetch all producer details for a given roleId
export const useFetchProducersQuery = (roleId) => {
  return useQuery({
    queryKey: producerDetailsKeyFactory({ roleId }).all,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch a single producer detail by id
export const useFetchProducerById = (id) => {
  return useQuery({
    queryKey: producerDetailsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new producer
export const useAddProducerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
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
    onSuccess: (newProducer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          roleId: variables.role_id || variables.roleId,
        },
        newEntity: newProducer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: { roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Update producer
export const useUpdateProducerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
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
    onSuccess: (newProducer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: { id: variables.id },
        newEntity: newProducer,
      });
    },
    onSettled: (_data, _err, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: { id: variables.id, roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Delete producer
export const useDeleteProducerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("producer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
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
        keyFactory: producerDetailsKeyFactory,
        entity: { roleId: variables.roleId },
      });
    },
  });
};
