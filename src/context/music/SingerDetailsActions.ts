import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from "../../supabase";
import { singerDetailsKeyFactory } from "../helpers/music/musicKeys";
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem,
} from "../helpers/cacheHandler";

// Interface for singer_details table
export interface SingerDetail {
  id: string;
  role_id: string;
  voice_type: string;
  music_genre: string;
  level: string;
  profile_id: string;
}

export interface AddSingerParams {
  details: Omit<SingerDetail, "id"> & Partial<Pick<SingerDetail, "id">>;
}

export interface UpdateSingerParams {
  id: string;
  details: Partial<SingerDetail>;
}

export interface DeleteSingerParams {
  id: string;
  role_id: string;
}

export const useFetchSingersQuery = (roleId: string): UseQueryResult<SingerDetail[]> => {
  const queryKey = singerDetailsKeyFactory({ role_id: roleId })?.all ?? ["singer_details", "all", roleId ?? ""];
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data as SingerDetail[];
    },
    enabled: !!roleId,
  });
};

export const useFetchSingerById = (id: string): UseQueryResult<SingerDetail> => {
  const queryKey = singerDetailsKeyFactory({ id })?.single ?? ["singer_details", "single", id ?? ""];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data as SingerDetail;
    },
    enabled: !!id,
  });
};

export const useAddSingerMutation = (): UseMutationResult<SingerDetail, Error, AddSingerParams> => {
  const queryClient = useQueryClient();
  return useMutation<SingerDetail, Error, AddSingerParams>({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as SingerDetail;
    },
    onMutate: async ({ details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: `temp-${Date.now()}`,
          ...details,
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
    onSuccess: (newSinger, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: newSinger.id,
          role_id: newSinger.role_id,
          voice_type: newSinger.voice_type ?? "",
          music_genre: newSinger.music_genre ?? "",
          level: newSinger.level ?? "",
          profile_id: newSinger.profile_id ?? "",
        },
        newEntity: newSinger,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: "",
          role_id: variables.details.role_id,
          voice_type: "",
          music_genre: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};

export const useUpdateSingerMutation = (): UseMutationResult<SingerDetail, Error, UpdateSingerParams> => {
  const queryClient = useQueryClient();
  return useMutation<SingerDetail, Error, UpdateSingerParams>({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0] as SingerDetail;
    },
    onMutate: async ({ id, details }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: { id, ...details },
        type: "update",
      });
    },
    onError: (_err, _variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context as any,
      });
    },
    onSuccess: (newSinger, variables) => {
      replaceOptimisticItem({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: newSinger.id,
          role_id: newSinger.role_id,
          voice_type: newSinger.voice_type ?? "",
          music_genre: newSinger.music_genre ?? "",
          level: newSinger.level ?? "",
          profile_id: newSinger.profile_id ?? "",
        },
        newEntity: newSinger,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: variables.id,
          role_id: variables.details?.role_id ?? "",
          voice_type: "",
          music_genre: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};

export const useDeleteSingerMutation = (): UseMutationResult<void, Error, DeleteSingerParams> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteSingerParams>({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("singer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, role_id }) => {
      return optimisticUpdate({
        queryClient,
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id,
          role_id,
          voice_type: "",
          music_genre: "",
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
        keyFactory: singerDetailsKeyFactory,
        entity: {
          id: "",
          role_id: variables.role_id,
          voice_type: "",
          music_genre: "",
          level: "",
          profile_id: "",
        },
      });
    },
  });
};
