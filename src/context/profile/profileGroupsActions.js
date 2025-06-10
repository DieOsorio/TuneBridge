import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupsKeyFactory } from "../helpers/profile/profileKeys";

// FETCH ALL PROFILE GROUPS
export const useFetchProfileGroupsQuery = () => {
  return useQuery({
    queryKey: profileGroupsKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .order("created_at", { ascending: false }); // Order by creation date (most recent first)

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// FETCH A SPECIFIC PROFILE GROUP
export const useFetchProfileGroupQuery = (id) => {
  return useQuery({
    queryKey: profileGroupsKeyFactory({ id }).single,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .eq("id", id)
        .single(); // Fetch a single group by ID

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id, // Only run the query if an ID is provided
  });
};

// CREATE NEW PROFILE GROUP
export const useCreateProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .insert(group)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async (group) => {
      const optimisticGroup = {
        id: group.id || `temp-${Date.now()}`,
        ...group,
        created_at: new Date().toISOString(),
      };
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: optimisticGroup,
        type: "add",
      });
      return { previousData, optimisticGroup };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSuccess: (data, _variables, context) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: context.optimisticGroup,
        newEntity: data,
      });
    },

    onSettled: () => {
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};

// UPDATE PROFILE GROUP
export const useUpdateProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedGroup }) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .update(updatedGroup)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async ({ id, updatedGroup }) => {
      const optimisticGroup = { id, ...updatedGroup };
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: optimisticGroup,
        type: "update",
      });
      return { previousData, optimisticGroup };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSuccess: (data, _variables, context) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: context.optimisticGroup,
        newEntity: data,
      });
    },

    onSettled: (data, _error, { id }) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};

// DELETE PROFILE GROUP
export const useDeleteProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("users")
        .from("profile_groups")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    // Optimistic update
    onMutate: async (id) => {
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: { id },
        type: "remove",
      });
      return { previousData, id };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSettled: (data, _error, context) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id: context?.id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};