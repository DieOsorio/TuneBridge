
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { djDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface DjDetails {
  id: string;
  role_id: string;
  created_at?: string;
  [key: string]: any;
}

export interface AddDjParams {
  details: Partial<DjDetails>;
}
export interface UpdateDjParams {
  id: string;
  details: Partial<DjDetails>;
}
export interface DeleteDjParams {
  id: string;
  roleId?: string;
}

export const useFetchDjsQuery = (roleId: string): UseQueryResult<DjDetails[], Error> => {
  return useQuery<DjDetails[], Error>({
    queryKey: djDetailsKeyFactory({ role_id: roleId }).all ?? ["djDetailsList", roleId ?? ""],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data as DjDetails[];
    },
    enabled: !!roleId,
  });
};

export const useFetchDjById = (id: string): UseQueryResult<DjDetails, Error> => {
  return useQuery<DjDetails, Error>({
    queryKey: djDetailsKeyFactory({ id }).single ?? ["djDetails", id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as DjDetails;
    },
    enabled: !!id,
  });
};

export const useAddDjMutation = (): UseMutationResult<DjDetails, Error, AddDjParams> => {
  const queryClient = useQueryClient();
  return useMutation<DjDetails, Error, AddDjParams>({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as DjDetails;
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: djDetailsKeyFactory,
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
    onSuccess: (newDj, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: {
          id: newDj.id,
          role_id: newDj.role_id ?? "",
        },
        newEntity: newDj,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { id: "", role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useUpdateDjMutation = (): UseMutationResult<DjDetails, Error, UpdateDjParams> => {
  const queryClient = useQueryClient();
  return useMutation<DjDetails, Error, UpdateDjParams>({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as DjDetails;
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: djDetailsKeyFactory,
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
    onSuccess: (newDj, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { id: newDj.id, role_id: newDj.role_id ?? "" },
        newEntity: newDj,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: djDetailsKeyFactory,
        entity: { id: variables.id, role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useDeleteDjMutation = (): UseMutationResult<void, Error, DeleteDjParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteDjParams>({
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
        keyFactory: djDetailsKeyFactory,
        entity: { id: "", role_id: variables.roleId ?? "" },
      });
    },
  });
};
