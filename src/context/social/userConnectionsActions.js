import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL CONNECTIONS FOR A PROFILE
export const fetchConnectionsQuery = (profileId) => {
  return useQuery({
    queryKey: ["connections", profileId],
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


// ADD NEW CONNECTION (FOLLOW)
export const addConnectionMutation = () => {
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
      await queryClient.cancelQueries({queryKey: ["connections"]});

      const previousDetails = queryClient.getQueryData(["connections"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...connection,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["connections"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["connections"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["connections"]});
    }
  })
}


// UPDATE AN CONNECTION
export const updateConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updatedConnection}) => {
      const { data, error } = await supabase
      .schema("social")
      .from("user_connections")
      .update(updatedConnection)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["connections", id] });

      const previousDetails = queryClient.getQueryData(["connections", id]);

      queryClient.setQueryData(["connections", id], (old = []) =>
        old.map((conn) =>
          conn.id === id
            ? { ...conn, ...details }
            : conn
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["connections", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["connections", variables.id] });
    },
  })
}


// DELETE CONNECTION (UNFOLLOW)
export const deleteConnectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ( id ) => {
      const { error } = await supabase
        .schema("social")
        .from("user_connections")
        .delete()
        .eq("id", id);
      
      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ( id ) => {
      await queryClient.cancelQueries({ queryKey: ["connections"] });

      const previousDetails = queryClient.getQueryData(["connections"]);

      queryClient.setQueryData(["connections"], (old = []) =>
        old.filter((dj) => dj.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["connections"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  })
} 
