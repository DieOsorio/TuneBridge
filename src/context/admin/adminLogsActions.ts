import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { adminLogsKeyFactory } from "../helpers/admin/keys";
import { optimisticUpdate, rollbackCache, invalidateKeys, replaceOptimisticItem } from "../helpers/cacheHandler";

export interface AdminLog {
  id: string;
  profile_id: string;
  action_type: string;
  target_table?: string | null;
  target_id?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

/* ────── fetch all admin logs ────── */
export const useAllAdminLogsQuery = () => {
  return useQuery({
    queryKey: adminLogsKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
};

/* ────── fetch logs by admin profile ────── */
export const useAdminLogsQuery = (profile_id: string): UseQueryResult<AdminLog[], Error> => {
  const queryClient = useQueryClient();

  return useQuery<AdminLog[], Error>({
    queryKey: adminLogsKeyFactory({ profileId: profile_id }).all ?? ["adminLogs", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_logs")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      // Cache single logs individually
      (data ?? []).forEach((log) => {
        queryClient.setQueryData(adminLogsKeyFactory({ id: log.id }).single ?? ["adminLog", log.id], log);
      });
      return data ?? [];
    },
    enabled: !!profile_id,
  });
};

/* ────── insert new log ────── */
export const useInsertAdminLogMutation = (): UseMutationResult<AdminLog, Error, Partial<AdminLog>> => {
  const queryClient = useQueryClient();

  return useMutation<AdminLog, Error, Partial<AdminLog>>({
    mutationFn: async (log) => {
      const { data, error } = await supabase
        .schema("admin")
        .from("admin_logs")
        .insert(log)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as AdminLog;
    },
    onMutate: async (log) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: AdminLog) => adminLogsKeyFactory({ profileId: entity.profile_id }) ?? { all: ["adminLogs", entity.profile_id ?? ""] },
        type: "add",
        entity: log as AdminLog,
      }),
    onSuccess: (newLog, vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: AdminLog) => adminLogsKeyFactory({ profileId: entity.profile_id }) ?? { all: ["adminLogs", entity.profile_id ?? ""] },
        entity: vars as AdminLog,
        newEntity: newLog,
      }),
    onError: (_e, vars, ctx) =>
      rollbackCache({
        queryClient,
        previousData: ctx as Record<string, unknown>,
      }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminLogsKeyFactory({ profileId: vars.profile_id }),
        entity: vars as AdminLog,
      }),
  });
};
