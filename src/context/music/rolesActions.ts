import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { roleKeyFactory } from '../helpers/music/musicKeys';
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from '../helpers/cacheHandler';

// Interface for roles table
export interface Role {
  id: string;
  role: string;
  profile_id: string;
}

export interface AddRoleParams {
  profileId: string;
  roleName: string;
}

export interface DeleteRoleParams {
  id: string;
  profileId: string;
}

export const useFetchRolesQuery = (profileId: string): UseQueryResult<Role[]> => {
  const queryKey = roleKeyFactory({ profile_id: profileId })?.all ?? ["roles", "all", profileId ?? ""];
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!profileId) {
        console.error("profileId is not available");
        return [];
      }
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .select("*")
        .eq("profile_id", profileId);
      if (error) throw new Error(error.message);
      return data as Role[];
    },
    enabled: !!profileId,
  });
};

export const useAddRoleMutation = (): UseMutationResult<Role, Error, AddRoleParams> => {
  const queryClient = useQueryClient();
  return useMutation<Role, Error, AddRoleParams>({
    mutationFn: async ({ profileId, roleName }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .insert({ profile_id: profileId, role: roleName })
        .select();
      if (error) throw new Error(error.message);
      return data[0] as Role;
    },
    onMutate: async ({ profileId, roleName }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          profile_id: profileId,
          role: roleName,
        },
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSuccess: (newRole, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: newRole.id,
          profile_id: newRole.profile_id,
          role: newRole.role,
        },
        newEntity: newRole,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: "",
          profile_id: variables.profileId,
          role: "",
        },
      });
    },
  });
};

export const useDeleteRoleMutation = (): UseMutationResult<void, Error, DeleteRoleParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteRoleParams>({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("roles")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, profileId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id,
          profile_id: profileId,
          role: "",
        },
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: "",
          profile_id: variables.profileId,
          role: "",
        },
      });
    },
  });
};
