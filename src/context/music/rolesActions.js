import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { roleKeyFactory } from '../helpers/music/musicKeys';
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from '../helpers/cacheHandler';

// Fetch all roles for a profile
export const useFetchRolesQuery = (profileId) => {
  return useQuery({
    queryKey: roleKeyFactory({ profileId }).all,
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
      return data;
    },
    enabled: !!profileId,
  });
};

// Add a role to a profile
export const useAddRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, roleName }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .insert({ profile_id: profileId, role: roleName })
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async ({ profileId, roleName }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          profile_id: profileId,
          role: roleName,
          created_at: new Date().toISOString(),
          profileId,
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
    onSuccess: (newRole, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: {
          id: variables.id || `temp-${Date.now()}`,
          profileId: variables.profileId,
        },
        newEntity: newRole,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: roleKeyFactory,
        entity: { profileId: variables.profileId },
      });
    },
  });
};

// Delete a role from a profile
export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profileId }) => {
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
        entity: { id, profileId },
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
        keyFactory: roleKeyFactory,
        entity: { profileId: variables.profileId },
      });
    },
  });
};
