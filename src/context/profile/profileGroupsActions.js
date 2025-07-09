import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import {
  optimisticUpdate,
  rollbackCache,
  replaceOptimisticItem,
  invalidateKeys,
} from "../helpers/cacheHandler";
import { profileGroupsKeyFactory } from "../helpers/profile/profileKeys";

/* ------------------------------------------------------------------
   Queries
------------------------------------------------------------------ */

export const useFetchProfileGroupsQuery = () =>
  useQuery({
    queryKey: profileGroupsKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });

export const useFetchProfileGroupQuery = (id) =>
  useQuery({
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
      return data;
    },
  });

/* ------------------------------------------------------------------
   Create mutation (optimistic)
------------------------------------------------------------------ */

export const useCreateProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    /* Supabase insert ---------------------------------------------------------------- */
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .insert(payload)
        .select();
      if (error) throw new Error(error.message);
      return data[0]; // real row
    },

    /* Optimistic add ----------------------------------------------------------------- */
    onMutate: async (group) => {
      // stable id for matching placeholder ⇄ real row
      group.client_id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `temp-${Date.now()}`;

      const optimisticGroup = {
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

    /* Rollback on error -------------------------------------------------------------- */
    onError: (_err, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx?.previousData }),

    /* Swap placeholder for real row -------------------------------------------------- */
    onSuccess: (data, _vars, ctx) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: ctx.optimisticGroup,
        newEntity: data,
        idKey: (a, b) => a?.client_id && a.client_id === b?.client_id,
      }),

    /* Final invalidate --------------------------------------------------------------- */
    onSettled: () =>
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory }),
  });
};

/* ------------------------------------------------------------------
   Update mutation (optimistic)
------------------------------------------------------------------ */

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

    onMutate: async ({ id, updatedGroup }) => {
      const cached =
        queryClient
          .getQueryData(profileGroupsKeyFactory().all)
          ?.find((g) => g.id === id) || {};

      const optimisticGroup = { ...cached, ...updatedGroup, id };

      const previousData = optimisticUpdate({
        queryClient,
        keyFactory: profileGroupsKeyFactory,
        entity: optimisticGroup,
        type: "update",
        idKey: (a, b) => a.id === b?.id,
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

    onSettled: (_d, _e, { id }) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};

/* ------------------------------------------------------------------
   Delete mutation (optimistic)
------------------------------------------------------------------ */

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

    onMutate: async (id) => {
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

    onSettled: (_d, _e, ctx) => {
      invalidateKeys({
        queryClient,
        keyFactory: () => profileGroupsKeyFactory({ id: ctx?.id }),
      });
      invalidateKeys({ queryClient, keyFactory: profileGroupsKeyFactory });
    },
  });
};
