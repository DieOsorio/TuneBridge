import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { adminReportsKeyFactory } from "../helpers/admin/keys";
import { optimisticUpdate, rollbackCache, invalidateKeys } from "../helpers/cacheHandler";

export interface UserReport {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string;
  target_owner_id: string;
  reason: string;
  status: string;
  handled_by?: string | null;
  notes?: string | null;
  created_at: string;
}

/* ────── fetch all reports ────── */
export const useAdminAllReportsQuery = (): UseQueryResult<UserReport[], Error> => {
  const queryClient = useQueryClient();
  return useQuery<UserReport[], Error>({
    queryKey: adminReportsKeyFactory().all!,
    queryFn: async () => {
      const { data, error, status } = await supabase
        .schema("admin")
        .from("user_reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
};


/* ────── fetch reports by reporter ────── */
export const useUserReportsQuery = (profileId: string): UseQueryResult<UserReport[], Error> => {
  const queryClient = useQueryClient();
  return useQuery<UserReport[], Error>({
    queryKey: adminReportsKeyFactory({ profileId }).all ?? ["userReports", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("user_reports")
        .select("*")
        .eq("reporter_id", profileId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!profileId,
  });
};

/* ────── insert new report ────── */
export const useInsertUserReportMutation = (): UseMutationResult<UserReport, Error, Partial<UserReport>> => {
  const queryClient = useQueryClient();
  return useMutation<UserReport, Error, Partial<UserReport>>({
    mutationFn: async (report) => {
      const { data, error } = await supabase
        .schema("admin")
        .from("user_reports")
        .insert(report)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserReport;
    },
    onMutate: async (report) =>
      optimisticUpdate({
        queryClient,
        keyFactory: () => adminReportsKeyFactory({ profileId: report.reporter_id ?? "" }),
        type: "add",
        entity: report as UserReport,
      }),
    onError: (_e, _vars, context) =>
      rollbackCache({ queryClient, previousData: context as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminReportsKeyFactory({ profileId: vars.reporter_id ?? "" }),
        entity: vars as UserReport,
      }),
  });
};

/* ────── update report ────── */
export const useUpdateUserReportMutation = (): UseMutationResult<UserReport, Error, Partial<UserReport>> => {
  const queryClient = useQueryClient();
  return useMutation<UserReport, Error, Partial<UserReport>>({
    mutationFn: async (report) => {
      const { id, ...rest } = report;
      if (!id) throw new Error("Report ID is required");
      const { data, error } = await supabase
        .schema("admin")
        .from("user_reports")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserReport;
    },
    onMutate: async (report) =>
      optimisticUpdate({
        queryClient,
        keyFactory: () => adminReportsKeyFactory({ profileId: report.reporter_id ?? "" }),
        type: "update",
        entity: report as UserReport,
      }),
    onError: (_e, _vars, context) =>
      rollbackCache({ queryClient, previousData: context as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminReportsKeyFactory({ profileId: vars.reporter_id ?? "" }),
        entity: vars as UserReport,
      }),
  });
};

/* ────── delete report ────── */
export const useDeleteUserReportMutation = (): UseMutationResult<void, Error, { id: string; reporter_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; reporter_id: string }>({
    mutationFn: async ({ id }) => {
      const { error } = await supabase.schema("admin").from("user_reports").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ reporter_id }) => {
      const key = adminReportsKeyFactory({ profileId: reporter_id }).all ?? (["userReports", reporter_id] as const);
      await queryClient.cancelQueries({ queryKey: key });
      const previousData = queryClient.getQueryData(key) ?? [];
      queryClient.setQueryData(key, []);
      return { previousData };
    },
    onError: (_e, _vars, context) => {
      const ctx = context as { previousData?: unknown } | undefined;
      if (ctx?.previousData) {
        const key = adminReportsKeyFactory({ profileId: _vars.reporter_id }).all ?? ["userReports", _vars.reporter_id];
        queryClient.setQueryData(key, ctx.previousData);
      }
    },
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminReportsKeyFactory({ profileId: vars.reporter_id }),
        entity: { id: vars.id } as UserReport,
      }),
  });
};
