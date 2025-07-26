import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { composerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface ComposerDetails {
  id: string;
  profile_id: string;
  role_id: string;
  composition_style: string | null;
  years_of_experience: string | null;
  level: string | null;
  [key: string]: any;
}

export interface AddComposerParams {
  details: Partial<ComposerDetails>;
}
export interface UpdateComposerParams {
  id: string;
  details: Partial<ComposerDetails>;
}
export interface DeleteComposerParams {
  id: string;
  roleId?: string;
}

export const useFetchComposersQuery = (roleId: string): UseQueryResult<ComposerDetails[], Error> => {
  return useQuery<ComposerDetails[], Error>({
    queryKey: composerDetailsKeyFactory({ role_id: roleId }).all ?? ["composerDetailsList", roleId ?? ""],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data as ComposerDetails[];
    },
    enabled: !!roleId,
  });
};

export const useFetchComposerById = (id: string): UseQueryResult<ComposerDetails, Error> => {
  return useQuery<ComposerDetails, Error>({
    queryKey: composerDetailsKeyFactory({ id }).single ?? ["composerDetails", id ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as ComposerDetails;
    },
    enabled: !!id,
  });
};

export const useAddComposerMutation = (): UseMutationResult<ComposerDetails, Error, AddComposerParams> => {
  const queryClient = useQueryClient();
  return useMutation<ComposerDetails, Error, AddComposerParams>({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ComposerDetails;
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
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
    onSuccess: (newComposer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: newComposer,
        newEntity: newComposer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id: "", role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useUpdateComposerMutation = (): UseMutationResult<ComposerDetails, Error, UpdateComposerParams> => {
  const queryClient = useQueryClient();
  return useMutation<ComposerDetails, Error, UpdateComposerParams>({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ComposerDetails;
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
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
    onSuccess: (newComposer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: newComposer,
        newEntity: newComposer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: composerDetailsKeyFactory,
        entity: { id: variables.id, role_id: variables.details.role_id ?? variables.details.roleId ?? "" },
      });
    },
  });
};

export const useDeleteComposerMutation = (): UseMutationResult<void, Error, DeleteComposerParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteComposerParams>({
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
        keyFactory: composerDetailsKeyFactory,
        entity: { id: "", role_id: variables.roleId ?? "" },
      });
    },
  });
};
