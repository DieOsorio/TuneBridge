import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupMembersKeyFactory, userGroupsKeyFactory } from "../helpers/profile/profileKeys";

// FETCH ALL MEMBERS OF A GROUP
export const useFetchGroupMembersQuery = (profileGroupId) => {
  return useQuery({
    queryKey: profileGroupMembersKeyFactory({ profileGroupId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("*, profiles(*)") // Fetch member details and related profile info
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileGroupId, // Only fetch if profileGroupId is provided
  });
};

// FETCH ALL GROUPS A USER IS PART OF
export const useFetchUserGroupsQuery = (userId) => {
  return useQuery({
    queryKey: userGroupsKeyFactory({ userId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("profile_group_id, profile_groups(*)") // Fetch group details
        .eq("profile_id", userId); // Filter by user ID

      if (error) throw new Error(error.message);
      return data.map((member) => member.profile_groups); // Return only the group details
    },
    enabled: !!userId, // Only fetch if userId is provided
  });
};

// ADD A MEMBER TO A GROUP
export const useAddGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (member) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .insert(member)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async (member) => {
      const optimisticMember = {
        id: member.id || `temp-${Date.now()}`,
        ...member,
        joined_at: new Date().toISOString(),
      };
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: optimisticMember,
        type: "add",
      });
      return { previousData, optimisticMember };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSuccess: (data, _variables, context) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: context.optimisticMember,
        newEntity: data,
      });
    },

    onSettled: (data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () =>
          profileGroupMembersKeyFactory({ profileGroupId: variables.profile_group_id }),
      });
    },
  });
};

// UPDATE A MEMBER IN A GROUP
export const useUpdateGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileGroupId, profileId, updates }) => {
      
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .update(updates)
        .eq("profile_group_id", profileGroupId)
        .eq("profile_id", profileId)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async ({ profileGroupId, profileId, updates }) => {
      const optimisticMember = { ...updates, profile_group_id: profileGroupId, profile_id: profileId };
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: optimisticMember,
        type: "update",
        idKey: "profile_id",
      });
      return { previousData, optimisticMember, profileGroupId };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSuccess: (data, _variables, context) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: context.optimisticMember,
        newEntity: data,
        idKey: "profile_id",
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupMembersKeyFactory({ profileGroupId: variables.profileGroupId }),
      });
    },
  });
};

// REMOVE A MEMBER FROM A GROUP
export const useRemoveGroupMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileGroupId, profileId }) => {
      
      const { error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .delete()
        .eq("profile_group_id", profileGroupId)
        .eq("profile_id", profileId);

      if (error) throw new Error(error.message);
    },

    // Optimistic update
    onMutate: async ({ profileGroupId, profileId }) => {
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: { profile_group_id: profileGroupId, profile_id: profileId },
        type: "remove",
        idKey: "profile_id",
      });
      return { previousData, profileGroupId, profileId };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSettled: (data, _error, context) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupMembersKeyFactory({ profileGroupId: context?.profileGroupId }),
      });
    },
  });
};