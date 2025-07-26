import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import {
  profileGroupMembersKeyFactory,
  userGroupsKeyFactory,
} from "../helpers/profile/profileKeys";
import type { Profile } from "./profileActions"
import type { ProfileGroup } from "./profileGroupsActions"

// Define TypeScript types for group member and related entities

export interface ProfileGroupMember {
  id?: string; // optional because optimistic adds temp id
  profile_id: string;
  profile_group_id: string;
  role?: string | null;
  joined_at?: string | null;
  roles_in_group?: string[];
  profiles?: Profile;
}
interface UpdateMemberContext {
  previousData: ReturnType<typeof optimisticUpdate>;
  optimisticMember: ProfileGroupMember;
  profileGroupId: string;
}

// --------------------------------------------
// QUERIES
// --------------------------------------------

// GET MEMBER ROLE
export const useUserGroupRole = ({
  profileId,
  groupId,
}: {
  profileId: string;
  groupId: string;
}): UseQueryResult<string | null, Error> => {
  return useQuery({
    queryKey: ["user-group-role", profileId, groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("role")
        .eq("profile_id", profileId)
        .eq("profile_group_id", groupId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return data?.role ?? null;
    },
    enabled: !!profileId && !!groupId,
  });
};

// FETCH ALL MEMBERS OF A GROUP
export const useFetchGroupMembersQuery = (
  profileGroupId: string
): UseQueryResult<ProfileGroupMember[], Error> => {
  
  return useQuery({
    queryKey: profileGroupMembersKeyFactory({ profileGroupId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("*, profiles(*)")
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return data as ProfileGroupMember[];
    },
    enabled: !!profileGroupId,
  });
};

// HOW MANY MEMBERS
export const useHowManyMembersQuery = (
  profileGroupId: string
): UseQueryResult<number, Error> => {
  return useQuery({
    queryKey: profileGroupMembersKeyFactory({ profileGroupId }).all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("*")
        .eq("profile_group_id", profileGroupId);

      if (error) throw new Error(error.message);
      return data.length;
    },
    enabled: !!profileGroupId,
  });
};

// FETCH ALL GROUPS A USER IS PART OF
export const useFetchUserGroupsQuery = (
  userId: string
): UseQueryResult<ProfileGroup[], Error> => {
  return useQuery({
    queryKey: userGroupsKeyFactory({ userId }).all ?? [`userGroups`, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .select("profile_groups(*)")
        .eq("profile_id", userId);

      if (error) throw new Error(error.message);

      return (data ?? []).map((row) => row.profile_groups);
    },
    enabled: !!userId,
  });
};

// --------------------------------------------
// MUTATIONS
// --------------------------------------------

// ADD A MEMBER TO A GROUP
export const useAddGroupMemberMutation = (): UseMutationResult<
  ProfileGroupMember,
  Error,
  ProfileGroupMember
> => {
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

    onMutate: async (member) => {
      const optimisticMember: ProfileGroupMember = {
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

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: () =>
          profileGroupMembersKeyFactory({ profileGroupId: variables.profile_group_id }),
      });
    },
  });
};

// UPDATE A MEMBER IN A GROUP
export const useUpdateGroupMemberMutation = (): UseMutationResult<
  ProfileGroupMember,
  Error,
  { member: ProfileGroupMember; updates: Partial<ProfileGroupMember> },
  UpdateMemberContext
> => {
  const queryClient = useQueryClient();

  return useMutation<ProfileGroupMember, Error, { member: ProfileGroupMember; updates: Partial<ProfileGroupMember> }, UpdateMemberContext>({
    mutationFn: async ({ member, updates }) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_group_members")
        .update(updates)
        .eq("profile_group_id", member.profile_group_id)
        .eq("profile_id", member.profile_id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ member, updates }) => {
      const optimisticMember: ProfileGroupMember = {
        ...updates,
        profile_group_id: member.profile_group_id,
        profile_id: member.profile_id,
      };

      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity: optimisticMember,
        type: "update",
        idKey: (a, b) =>
          a?.profile_id === b?.profile_id &&
          a?.profile_group_id === b?.profile_group_id,
      });

      return {
        previousData,
        optimisticMember,
        profileGroupId: member.profile_group_id,
      };
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
        idKey: (a, b) =>
          a?.profile_id === b?.profile_id &&
          a?.profile_group_id === b?.profile_group_id,
      });
    },

    onSettled: (_data, _error, _variables, context) => {
      invalidateKeys({
        queryClient,
        keyFactory: () =>
          profileGroupMembersKeyFactory({ profileGroupId: context?.profileGroupId }),
      });
    },
  });
};

// REMOVE A MEMBER FROM A GROUP
export const useRemoveGroupMemberMutation = (): UseMutationResult<
  void,
  Error,
  { profileGroupId: string; profileId: string }
> => {
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

    onMutate: async ({ profileGroupId, profileId }) => {
      const entity = {
        profile_group_id: profileGroupId,
        profile_id: profileId,
      };

      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupMembersKeyFactory,
        entity,
        type: "remove",
        idKey: (a, b) =>
          a?.profile_id === b?.profile_id &&
          a?.profile_group_id === b?.profile_group_id,
      });

      return { previousData, profileGroupId };
    },

    onError: (err, _variables, context) => {
      rollbackCache({ queryClient, previousData: context?.previousData });
    },

    onSettled: (_data, _error, context) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupMembersKeyFactory({ profileGroupId: context?.profileGroupId }),
      });
    },
  });
};
