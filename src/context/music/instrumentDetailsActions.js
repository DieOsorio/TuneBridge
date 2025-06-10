import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { instrumentDetailsKeyFactory } from '../helpers/music/musicKeys';
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from '../helpers/cacheHandler';

// Fetch all instruments for a given roleId
export const useFetchInstrumentsQuery = (roleId) => {
  return useQuery({
    queryKey: instrumentDetailsKeyFactory({ roleId }).all,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch a single instrument by id
export const useFetchInstrumentById = (id) => {
  return useQuery({
    queryKey: instrumentDetailsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new instrument
export const useAddInstrumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
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
    onSuccess: (newInstrument, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: {
          id: variables.id || variables.tempId || `temp-${Date.now()}`,
          roleId: variables.role_id || variables.roleId,
        },
        newEntity: newInstrument,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Update instrument
export const useUpdateInstrumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
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
    onSuccess: (newInstrument, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id: variables.id },
        newEntity: newInstrument,
      });
    },
    onSettled: (_data, _err, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id: variables.id, roleId: variables.role_id || variables.roleId },
      });
    },
  });
};

// Delete instrument
export const useDeleteInstrumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("instrument_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
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
        keyFactory: instrumentDetailsKeyFactory,
        entity: { roleId: variables.roleId },
      });
    },
  });
};
