import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { producerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

export interface ProducerDetail {
  id: string;
  role_id: string;
  created_at: string;
  preferred_genres: string;
  events_played: string;
  level: string;
  profile_id: string;
  [key: string]: any;
}

export interface AddProducerParams {
  details: Omit<ProducerDetail, "id" | "created_at"> & Partial<Pick<ProducerDetail, "created_at">>;
}

export interface UpdateProducerParams {
  id: string;
  details: Partial<ProducerDetail>;
}

export interface DeleteProducerParams {
  id: string;
  roleId: string;
}

export const useFetchProducersQuery = (roleId: string): UseQueryResult<ProducerDetail[]> => {
  const queryKey = producerDetailsKeyFactory({ role_id: roleId })?.all ?? ["producer_details", "all", roleId ?? ""];
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data as ProducerDetail[];
    },
    enabled: !!roleId,
  });
};

export const useFetchProducerById = (id: string): UseQueryResult<ProducerDetail> => {
  const queryKey = producerDetailsKeyFactory({ id })?.single ?? ["producer_details", "single", id ?? ""];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as ProducerDetail;
    },
    enabled: !!id,
  });
};

export const useAddProducerMutation = (): UseMutationResult<ProducerDetail, Error, AddProducerParams> => {
  const queryClient = useQueryClient();
  return useMutation<ProducerDetail, Error, AddProducerParams>({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ProducerDetail;
    },
    onMutate: async ({ details }) => {
      // Adapt entity to ProducerDetail shape
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          role_id: details.role_id ?? "",
          created_at: new Date().toISOString(),
          preferred_genres: details.preferred_genres ?? "",
          events_played: details.events_played ?? "",
          level: details.level ?? "",
          profile_id: details.profile_id ?? "",
        },
        type: "add",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSuccess: (newProducer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: newProducer.id,
          role_id: newProducer.role_id ?? "",
          created_at: newProducer.created_at ?? "",
          preferred_genres: newProducer.preferred_genres ?? "",
          events_played: newProducer.events_played ?? "",
          level: newProducer.level ?? "",
          profile_id: newProducer.profile_id ?? "",
        },
        newEntity: newProducer,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: "",
          role_id: variables.details.role_id ?? "",
          created_at: "",
          preferred_genres: "",
          events_played: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};

export const useUpdateProducerMutation = (): UseMutationResult<ProducerDetail, Error, UpdateProducerParams> => {
  const queryClient = useQueryClient();
  return useMutation<ProducerDetail, Error, UpdateProducerParams>({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as ProducerDetail;
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id,
          role_id: details.role_id ?? "",
          created_at: details.created_at ?? "",
          preferred_genres: details.preferred_genres ?? "",
          events_played: details.events_played ?? "",
          level: details.level ?? "",
          profile_id: details.profile_id ?? "",
        },
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSuccess: (newProducer, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: newProducer.id,
          role_id: newProducer.role_id ?? "",
          created_at: newProducer.created_at ?? "",
          preferred_genres: newProducer.preferred_genres ?? "",
          events_played: newProducer.events_played ?? "",
          level: newProducer.level ?? "",
          profile_id: newProducer.profile_id ?? "",
        },
        newEntity: newProducer,
      });
    },
    onSettled: (_data, _err, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: variables.id,
          role_id: variables.details?.role_id ?? "",
          created_at: "",
          preferred_genres: "",
          events_played: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};

export const useDeleteProducerMutation = (): UseMutationResult<void, Error, DeleteProducerParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteProducerParams>({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("producer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, roleId }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id,
          role_id: roleId,
          created_at: "",
          preferred_genres: "",
          events_played: "",
          level: "",
          profile_id: "",
        },
        type: "remove",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: producerDetailsKeyFactory,
        entity: {
          id: variables.id,
          role_id: variables.roleId,
          created_at: "",
          preferred_genres: "",
          events_played: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};
