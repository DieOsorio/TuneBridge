import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem
} from '../helpers/cacheHandler';
import { connectionKeyFactory } from '../helpers/social/socialKeys';

export interface UserConnection {
  id: string;
  follower_profile_id: string;
  following_profile_id: string;
  [key: string]: any;
}

export const useFetchConnectionsQuery = (profileId: string): UseQueryResult<UserConnection[], Error> => {
  return useQuery<UserConnection[], Error>({
    queryKey: connectionKeyFactory({ follower_profile_id: profileId }).follower ?? ["connections", profileId ?? ""],
    queryFn: async () => {
      if (!profileId) {
        console.error("profileId is not valid");
        return [];
      }
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .select("*")
        .or(`follower_profile_id.eq.${profileId},following_profile_id.eq.${profileId}`);
      if (error) throw new Error(error.message);
      return Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id ?? "",
            follower_profile_id: item.follower_profile_id ?? "",
            following_profile_id: item.following_profile_id ?? "",
            ...item
          }))
        : [];
    },
    enabled: !!profileId,
  });
};

export const useConnectionBetweenProfiles = (profileA: string, profileB: string): UseQueryResult<UserConnection | null, Error> => {
  return useQuery<UserConnection | null, Error>({
    queryKey: connectionKeyFactory({ follower_profile_id: profileA, following_profile_id: profileB }).between ?? ["connectionBetween", profileA ?? "", profileB ?? ""],
    queryFn: async () => {
      if (!profileA || !profileB) return null;
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .select("*")
        .or(`and(follower_profile_id.eq.${profileA},following_profile_id.eq.${profileB}),and(follower_profile_id.eq.${profileB},following_profile_id.eq.${profileA})`)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? {
        id: data.id ?? "",
        follower_profile_id: data.follower_profile_id ?? "",
        following_profile_id: data.following_profile_id ?? "",
        ...data
      } : null;
    },
    enabled: !!profileA && !!profileB,
  });
};

export const useAddConnectionMutation = (): UseMutationResult<UserConnection, Error, Partial<UserConnection>> => {
  const queryClient = useQueryClient();
  return useMutation<UserConnection, Error, Partial<UserConnection>>({
    mutationFn: async(connection) => {
      const { data, error}= await supabase
        .schema("social")
        .from("user_connections")
        .insert(connection)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserConnection;
    },
    onMutate: async (connection) =>
      optimisticUpdate({
        queryClient,
        entity: {
          ...connection,
          id: connection.id ?? "",
          follower_profile_id: connection.follower_profile_id ?? "",
          following_profile_id: connection.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory,
        type: "add",
      }),
    onSuccess: (newConnection, variables) =>
      replaceOptimisticItem({
        queryClient,
        entity: {
          ...variables,
          id: variables.id ?? "",
          follower_profile_id: variables.follower_profile_id ?? "",
          following_profile_id: variables.following_profile_id ?? ""
        },
        newEntity: newConnection,
        keyFactory: connectionKeyFactory
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        entity: {
          ...variables,
          id: variables.id ?? "",
          follower_profile_id: variables.follower_profile_id ?? "",
          following_profile_id: variables.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory
      })
  });
};

export const useUpdateConnectionMutation = (): UseMutationResult<UserConnection, Error, { connection: UserConnection; updatedConnection: Partial<UserConnection> }> => {
  const queryClient = useQueryClient();
  return useMutation<UserConnection, Error, { connection: UserConnection; updatedConnection: Partial<UserConnection> }>({
    mutationFn: async ({connection, updatedConnection}) => {
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .update(updatedConnection)
        .eq("id", connection.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as UserConnection;
    },
    onMutate: async ({ connection, updatedConnection }) =>
      optimisticUpdate({
        queryClient,
        entity: {
          ...connection,
          ...updatedConnection,
          id: connection.id ?? "",
          follower_profile_id: connection.follower_profile_id ?? "",
          following_profile_id: connection.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory,
        type: "update",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        entity: {
          ...variables.connection,
          id: variables.connection.id ?? "",
          follower_profile_id: variables.connection.follower_profile_id ?? "",
          following_profile_id: variables.connection.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory
      }),
  });
};

export const useDeleteConnectionMutation = (): UseMutationResult<void, Error, UserConnection> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserConnection>({
    mutationFn: async (connection) => {
      const { error } = await supabase
        .schema("social")
        .from("user_connections")
        .delete()
        .eq("id", connection.id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (connection) =>
      optimisticUpdate({
        queryClient,
        entity: {
          ...connection,
          id: connection.id ?? "",
          follower_profile_id: connection.follower_profile_id ?? "",
          following_profile_id: connection.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory,
        type: "remove",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        entity: {
          ...variables,
          id: variables.id ?? "",
          follower_profile_id: variables.follower_profile_id ?? "",
          following_profile_id: variables.following_profile_id ?? ""
        },
        keyFactory: connectionKeyFactory
      }),
  });
};
