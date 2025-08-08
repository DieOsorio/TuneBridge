import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { adminRolesKeyFactory } from "../helpers/admin/keys";
import { 
  optimisticUpdate, 
  rollbackCache, 
  invalidateKeys, 
} from "../helpers/cacheHandler";
import { useAuth } from "../AuthContext";

export interface AdminRole {
  profile_id: string;
  role: string;
  permissions: string[];
  created_at: string;
}

/* ────── check if user is admin ────── */
export const useIsAdmin = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["isAdmin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error, status } = await supabase
        .schema("admin")
        .from("admin_roles")
        .select("*")
        .eq("profile_id", user!.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return !!data;
    }
  });
};


/* ────── fetch all roles ────── */
export const useAllAdminRolesQuery = (): UseQueryResult<AdminRole[], Error> => {
  return useQuery<AdminRole[], Error>({
    queryKey: ["adminRoles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_roles")
        .select("*");

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
};

/* ────── fetch by profile ────── */
export const useAdminRolesQuery = (profile_id: string): UseQueryResult<AdminRole, Error> => {
  const queryClient = useQueryClient();
  return useQuery<AdminRole, Error>({
    queryKey: adminRolesKeyFactory({ profileId: profile_id }).single ?? ["adminRoles", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_roles")
        .select("*")
        .eq("profile_id", profile_id)
        .single();
        
      if (error) throw new Error(error.message);
      return data ?? null;
    },
    enabled: !!profile_id,
  });
};

/* ────── insert or update (upsert) ────── */
export const useUpsertAdminRoleMutation = (): UseMutationResult<AdminRole, Error, Partial<AdminRole>> => {
  const queryClient = useQueryClient();
  return useMutation<AdminRole, Error, Partial<AdminRole>>({
    mutationFn: async (role) => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_roles")
        .upsert(role, { onConflict: "profile_id" })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as AdminRole;
    },
    onMutate: async (role) =>
      optimisticUpdate({
        queryClient,
        keyFactory: () => adminRolesKeyFactory({ profileId: role.profile_id ?? "" }),
        type: "update",
        entity: role as AdminRole,
      }),
    onError: (_e, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminRolesKeyFactory({ profileId: vars.profile_id ?? "" }),
        entity: vars as AdminRole,
      }),
  });
};

/* ────── delete ────── */
export const useDeleteAdminRoleMutation = (): UseMutationResult<void, Error, { profile_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { profile_id: string }>({
    mutationFn: async ({ profile_id }) => {
      const { error } = await supabase
        .schema("admin")
        .from("admin_roles")
        .delete()
        .eq("profile_id", profile_id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ profile_id }) => {
      await queryClient.cancelQueries({
        queryKey: adminRolesKeyFactory({ profileId: profile_id }).all,
      });
      const key = adminRolesKeyFactory({ profileId: profile_id }).all ?? ["adminRoles", profile_id];
      const previousData = queryClient.getQueryData(key);
      queryClient.setQueryData(key, []);
      return { previousData };
    },
    onError: (_e, _vars, context) => {
      const ctx = context as { previousData?: unknown } | undefined;
      if (ctx?.previousData) {
        const key = adminRolesKeyFactory({ profileId: _vars.profile_id }).all ?? ["adminRoles", _vars.profile_id];
        queryClient.setQueryData(key, ctx.previousData);
      }
    },
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminRolesKeyFactory({ profileId: vars.profile_id }),
        entity: { profile_id: vars.profile_id } as AdminRole,
      }),
  });
};
