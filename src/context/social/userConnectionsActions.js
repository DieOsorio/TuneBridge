import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// helpers for optimistic updates and cache management
import {
  optimisticUpdate,
  rollbackCache,
  invalidateKeys,
  replaceOptimisticItem
} from '../helpers/cacheHandler';

// Define keys for connections
import { 
  connectionKeyFactory
 } from '../helpers/social/socialKeys';

// FETCH ALL CONNECTIONS FOR A PROFILE
export const useFetchConnectionsQuery = (profileId) => {
  return useQuery({
    queryKey: connectionKeyFactory({ follower_profile_id: profileId }).follower,
    queryFn: async() => {
      if (!profileId) {
        console.error("profileId is not valid");
        return [];
      }
      const { data, error } = await supabase
      .schema("social")
      .from("user_connections")
      .select("*")
      .or(`follower_profile_id.eq.${profileId},following_profile_id.eq.${profileId}`);

      if (error) throw new Error(error.message)
      return data;
    },
    enabled: !!profileId,
  })
}

// Get the connection between two specific profiles
export const useConnectionBetweenProfiles = (profileA, profileB) => {
  return useQuery({
    queryKey: connectionKeyFactory({ follower_profile_id: profileA, following_profile_id: profileB }).between,
    queryFn: async () => {
      if (!profileA || !profileB) return null;
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .select("*")
        .or(`and(follower_profile_id.eq.${profileA},following_profile_id.eq.${profileB}),and(follower_profile_id.eq.${profileB},following_profile_id.eq.${profileA})`)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileA && !!profileB,
  });
};

// ADD NEW CONNECTION (FOLLOW)
export const useAddConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(connection) => {
      const { data, error}= await supabase
      .schema("social")
      .from("user_connections")
      .insert(connection)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ( connection ) => {
      return await optimisticUpdate({
        queryClient,
        entity: connection,
        keyFactory: connectionKeyFactory,
        type: "add",
      });
    },

    onSuccess: (newConnection, variables) => {
      replaceOptimisticItem({
        queryClient,
        entity: variables,
        newEntity: newConnection,
        keyFactory: connectionKeyFactory
      });
    },

    onError: (_err, variables, context) => {
     rollbackCache({
        queryClient,
        entity: variables,
        keyFactory: connectionKeyFactory,
        previousData: context
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables,
        keyFactory: connectionKeyFactory
      });
    }
  })
}

// UPDATE A CONNECTION
export const useUpdateConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({connection, updatedConnection}) => {
      const { data, error } = await supabase
      .schema("social")
      .from("user_connections")
      .update(updatedConnection)
      .eq("id", connection.id)
      .select()

      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ connection }) => {
      return await optimisticUpdate({
        queryClient,
        entity: connection,
        keyFactory: connectionKeyFactory,
        type: "update",
      });
    },

    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        entity: variables.connection,
        keyFactory: connectionKeyFactory,
        previousData: context
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables.connection,
        keyFactory: connectionKeyFactory
      });
    },
  })
}

// DELETE CONNECTION (UNFOLLOW)
export const useDeleteConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ( connection ) => {
      const { error } = await supabase
        .schema("social")
        .from("user_connections")
        .delete()
        .eq("id", connection.id);

        
      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ( connection ) => {
      return await optimisticUpdate({
        queryClient,
        entity: connection,
        keyFactory: connectionKeyFactory,
        type: "remove",
      });
    },

    onError: (_err, variables, context) => {
      rollbackCache({
        queryClient,
        entity: variables,
        keyFactory: connectionKeyFactory,
        previousData: context
      });
    },

    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        entity: variables,
        keyFactory: connectionKeyFactory
      });
    },
  })
}

