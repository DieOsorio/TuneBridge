import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { adminFeedbackKeyFactory } from "../helpers/admin/keys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface UserFeedback {
  id: string;
  profile_id: string;
  type: string;
  message: string;
  status: string;
  response?: string | null;
  feedback_topic?: string | null;
  created_at: string;
}

/* ────── fetch all feedbacks ────── */
export const useAdminAllFeedbacksQuery = (): UseQueryResult<UserFeedback[], Error> => {
  return useQuery<UserFeedback[], Error>({
    queryKey: adminFeedbackKeyFactory().all!,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("user_feedback")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: true,
  });
};

/* ────── fetch feedbacks by profile ────── */
export const useUserFeedbacksQuery = (profile_id: string): UseQueryResult<UserFeedback[], Error> => {
  const queryClient = useQueryClient();
  return useQuery<UserFeedback[], Error>({
    queryKey: adminFeedbackKeyFactory({ profileId: profile_id }).all ?? ["userFeedbacks", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("admin")
        .from("user_feedback")
        .select("*")
        .eq("profile_id", profile_id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!profile_id,
  });
};

/* ────── insert new feedback ────── */
export const useInsertUserFeedbackMutation = (): UseMutationResult<UserFeedback, Error, Partial<UserFeedback>> => {
  const queryClient = useQueryClient();
  return useMutation<UserFeedback, Error, Partial<UserFeedback>>({
    mutationFn: async (feedback) => {
      const { data, error } = await supabase
        .schema("admin")
        .from("user_feedback")
        .insert(feedback)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserFeedback;
    },
    onMutate: async (feedback) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: UserFeedback) =>
          adminFeedbackKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userFeedbacks", entity.profile_id ?? ""] },
        type: "add",
        entity: {
          ...feedback,
          profile_id: feedback.profile_id ?? "",
          id: feedback.id ?? "",
          type: feedback.type ?? "suggestion",
          status: feedback.status ?? "unread",
          message: feedback.message ?? "",
          created_at: feedback.created_at ?? new Date().toISOString(),
        },
      }),
    onSuccess: (newFeedback, _vars) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: UserFeedback) => adminFeedbackKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userFeedbacks", entity.profile_id ?? ""] },
        entity: newFeedback,
        newEntity: newFeedback,
      }),
    onError: (_e, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: UserFeedback) => adminFeedbackKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userFeedbacks", entity.profile_id ?? ""] },
        entity: vars as UserFeedback,
      }),
  });
};

/* ────── update feedback ────── */
export const useUpdateUserFeedbackMutation = (): UseMutationResult<UserFeedback, Error, Partial<UserFeedback>> => {
  const queryClient = useQueryClient();
  return useMutation<UserFeedback, Error, Partial<UserFeedback>>({
    mutationFn: async (feedback) => {
      const { id, profile_id, ...rest } = feedback;
      const { data, error } = await supabase
        .schema("admin")
        .from("user_feedback")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserFeedback;
    },
    onMutate: async (feedback) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: UserFeedback) =>
          adminFeedbackKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userFeedbacks", entity.profile_id ?? ""] },
        type: "update",
        entity: {
          ...feedback,
          profile_id: feedback.profile_id ?? "",
          id: feedback.id ?? "",
          type: feedback.type ?? "suggestion",
          status: feedback.status ?? "unread",
          message: feedback.message ?? "",
          created_at: feedback.created_at ?? new Date().toISOString(),
        },
      }),
    onError: (_e, _vars, ctx) =>
      rollbackCache({ queryClient, previousData: ctx as Record<string, unknown> }),
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: UserFeedback) => adminFeedbackKeyFactory({ profileId: entity.profile_id }) ?? { all: ["userFeedbacks", entity.profile_id ?? ""] },
        entity: vars as UserFeedback,
      }),
  });
};

/* ────── delete feedback ────── */
export const useDeleteUserFeedbackMutation = (): UseMutationResult<void, Error, { id: string; profile_id: string }> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; profile_id: string }>({
    mutationFn: async ({ id }) => {
      const { error } = await supabase.schema("admin").from("user_feedback").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ profile_id }) => {
      const key = adminFeedbackKeyFactory({ profileId: profile_id }).all ?? (["userFeedbacks", profile_id] as const);
      await queryClient.cancelQueries({ queryKey: key });
      const previousData = queryClient.getQueryData(key) ?? [];
      queryClient.setQueryData(key, []);
      return { previousData };
    },
    onError: (_e, _vars, ctx) => {
      const ctxCast = ctx as { previousData?: unknown } | undefined;
      if (ctxCast?.previousData) {
        const key = adminFeedbackKeyFactory({ profileId: _vars.profile_id }).all ?? (["userFeedbacks", _vars.profile_id] as const);
        queryClient.setQueryData(key, ctxCast.previousData);
      }
    },
    onSettled: (_d, _e, vars) =>
      invalidateKeys({
        queryClient,
        keyFactory: () => adminFeedbackKeyFactory({ profileId: vars.profile_id }),
        entity: { id: vars.id } as UserFeedback,
      }),
  });
};
