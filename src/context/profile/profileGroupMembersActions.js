import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH ALL MEMBERS OF A GROUP
export const useFetchGroupMembersQuery = (profileGroupId) => {
  return useQuery({
    queryKey: ["profileGroupMembers", profileGroupId],
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
    queryKey: ["userGroups", userId],
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
      await queryClient.cancelQueries({
        queryKey: ["profileGroupMembers", member.profile_group_id],
      });

      const previousMembers = queryClient.getQueryData([
        "profileGroupMembers",
        member.profile_group_id,
      ]);

      const optimisticMember = {
        id: `temp-${Date.now()}`,
        ...member,
        joined_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["profileGroupMembers", member.profile_group_id],
        (old = []) => [optimisticMember, ...old]
      );

      return { previousMembers };
    },

    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ["profileGroupMembers", context.previousMembers.profile_group_id],
          context.previousMembers
        );
      }
    },

    onSettled: (data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profileGroupMembers", variables.profile_group_id],
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
      await queryClient.cancelQueries({
        queryKey: ["profileGroupMembers", profileGroupId],
      });

      const previousMembers = queryClient.getQueryData([
        "profileGroupMembers",
        profileGroupId,
      ]);

      queryClient.setQueryData(
        ["profileGroupMembers", profileGroupId],
        (old = []) => old.filter((member) => member.profile_id !== profileId)
      );

      return { previousMembers };
    },

    onError: (err, _variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ["profileGroupMembers", context.previousMembers.profile_group_id],
          context.previousMembers
        );
      }
    },

    onSettled: (data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profileGroupMembers", variables.profileGroupId],
      });
    },
  });
};