import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { instrumentDetailsKeyFactory } from '../helpers/music/musicKeys';
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from '../helpers/cacheHandler';

export interface InstrumentDetails {
  id: string;
  profile_id: string;
  role_id: string;
  instrument: string;
  years_of_experience: number | null;
  level: string | null;
  [key: string]: any;
}

export interface AddInstrumentParams {
  details: Partial<InstrumentDetails>;
}
export interface UpdateInstrumentParams {
  id: string;
  details: Partial<InstrumentDetails>;
}
export interface DeleteInstrumentParams {
  id: string;
  roleId?: string;
}


export const useFetchInstrumentsQuery = (roleId: string): UseQueryResult<InstrumentDetails[], Error> => {
  return useQuery<InstrumentDetails[], Error>({
    queryKey: instrumentDetailsKeyFactory({ role_id: roleId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data as InstrumentDetails[];
    },
    enabled: !!roleId,
  });
};

export const useFetchInstrumentById = (id: string): UseQueryResult<InstrumentDetails, Error> => {
  return useQuery<InstrumentDetails, Error>({
    queryKey: instrumentDetailsKeyFactory({ id }).single ?? ["instrumentDetails", id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as InstrumentDetails;
    },
    enabled: !!id,
  });
};

export const useAddInstrumentMutation = (): UseMutationResult<InstrumentDetails, Error, AddInstrumentParams> => {
  const queryClient = useQueryClient();
  return useMutation<InstrumentDetails, Error, AddInstrumentParams>({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as InstrumentDetails;
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          ...details,
          created_at: new Date().toISOString(),
          role_id: details.role_id ?? "",
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
    onSuccess: (newInstrument, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: newInstrument,
        newEntity: newInstrument,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id: "", role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useUpdateInstrumentMutation = (): UseMutationResult<InstrumentDetails, Error, UpdateInstrumentParams> => {
  const queryClient = useQueryClient();
  return useMutation<InstrumentDetails, Error, UpdateInstrumentParams>({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as InstrumentDetails;
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id, ...details, role_id: details.role_id ?? "" },
        type: "update",
      });
    },
    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown> | undefined,
      });
    },
    onSuccess: (newInstrument, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: newInstrument,
        newEntity: newInstrument,
      });
    },
    onSettled: (_data, _err, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id: variables.id, role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useDeleteInstrumentMutation = (): UseMutationResult<void, Error, DeleteInstrumentParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteInstrumentParams>({
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
        entity: { id, role_id: roleId ?? "" },
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
        keyFactory: instrumentDetailsKeyFactory,
        entity: { id: "", role_id: variables.roleId ?? "" },
      });
    },
  });
};
