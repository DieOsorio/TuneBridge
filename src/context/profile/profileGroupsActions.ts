import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupsKeyFactory } from "../helpers/profile/profileKeys";

export interface ProfileGroup {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  genre: string | null;
  created_by: string; 
  created_at: string; 
  client_id?: string; 
}

/* ------------------------------------------------------------------
   Queries
------------------------------------------------------------------ */

export const useFetchProfileGroupsQuery = (): UseQueryResult<ProfileGroup[], Error> =>
  useQuery<ProfileGroup[], Error>({
    queryKey: profileGroupsKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as ProfileGroup[];
    },
  });

export const useFetchProfileGroupQuery = (id: string): UseQueryResult<ProfileGroup, Error> =>
  useQuery<ProfileGroup, Error>({
    queryKey: profileGroupsKeyFactory({ id }).single,
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as ProfileGroup;
    },
  });

/* ------------------------------------------------------------------
   Create mutation (optimistic)
------------------------------------------------------------------ */

export const useCreateProfileGroupMutation = (): UseMutationResult<ProfileGroup, Error, Partial<ProfileGroup>, { previousData: any; optimisticGroup: ProfileGroup }> => {
  const queryClient = useQueryClient();
  return useMutation<ProfileGroup, Error, Partial<ProfileGroup>, { previousData: any; optimisticGroup: ProfileGroup }>({
    mutationFn: async (payload: Partial<ProfileGroup>) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .insert(payload)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ProfileGroup;
    },
    onMutate: async (group: Partial<ProfileGroup>) => {
      (group as ProfileGroup).client_id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `temp-${Date.now()}`;
      const optimisticGroup: ProfileGroup = {
        ...(group as ProfileGroup),
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
    onError: (_err, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx?.previousData }),
    onSuccess: (data, _vars, ctx) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: ctx.optimisticGroup,
        newEntity: data,
        idKey: (a: ProfileGroup, b: ProfileGroup) => !!(a?.client_id && a.client_id === b?.client_id),
      }),
    onSettled: () =>
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory }),
  });
};

/* ------------------------------------------------------------------
   Update mutation (optimistic)
------------------------------------------------------------------ */

export const useUpdateProfileGroupMutation = (): UseMutationResult<ProfileGroup, Error, { id: string; updatedGroup: Partial<ProfileGroup> }, { previousData: any; optimisticGroup: ProfileGroup }> => {
  const queryClient = useQueryClient();
  return useMutation<ProfileGroup, Error, { id: string; updatedGroup: Partial<ProfileGroup> }, { previousData: any; optimisticGroup: ProfileGroup }>({
    mutationFn: async ({ id, updatedGroup }: { id: string; updatedGroup: Partial<ProfileGroup> }) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .update(updatedGroup)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ProfileGroup;
    },
    onMutate: async ({ id, updatedGroup }: { id: string; updatedGroup: Partial<ProfileGroup> }) => {
      const cached =
        (queryClient
          .getQueryData(profileGroupsKeyFactory().all) as ProfileGroup[] | undefined)?.find((g) => g.id === id) || {};
      const optimisticGroup: ProfileGroup = { ...cached, ...updatedGroup, id } as ProfileGroup;
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: optimisticGroup,
        type: "update",
        idKey: (a: ProfileGroup, b: ProfileGroup) => !!(a.id && a.id === b?.id),
      });
      return { previousData, optimisticGroup };
    },
    onError: (_e, _v, ctx) =>
      rollbackCache({ queryClient, previousData: ctx?.previousData }),
    onSuccess: (data, _v, ctx) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: ctx.optimisticGroup,
        newEntity: data,
      }),
    onSettled: (
      _data: ProfileGroup | undefined,
      _error: Error | null,
      _variables: { id: string; updatedGroup: Partial<ProfileGroup> },
      ctx: { previousData: any; optimisticGroup: ProfileGroup } | undefined
    ) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id: ctx?.optimisticGroup?.id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};

/* ------------------------------------------------------------------
   Delete mutation (optimistic)
------------------------------------------------------------------ */

export const useDeleteProfileGroupMutation = (): UseMutationResult<void, Error, string, { previousData: any; id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { previousData: any; id: string }>({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .schema("users")
        .from("profile_groups")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id: string) => {
      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: { id },
        type: "remove",
      });
      return { previousData, id };
    },
    onError: (_e, _v, ctx) =>
      rollbackCache({ queryClient, previousData: ctx?.previousData }),
    onSettled: (
      _data: void | undefined,
      _error: Error | null,
      _variables: string,
      ctx: { previousData: any; id: string } | undefined
    ) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id: ctx?.id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};
