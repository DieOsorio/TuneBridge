import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// Fetch all instruments for a profile
export const fetchInstrumentsQuery = (roleId) => {
  
  return useQuery({
    queryKey: ["instrumentDetails", roleId],
    queryFn: async () => {
      if (!roleId) {
        console.error("roleId is not avialable");
        return []
      }

      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select ("*")
        .eq("role_id", roleId)
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!roleId,
  })
};

// ADD NEW INSTRUMENT INFORMATION
export const addInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({details}) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data [0];
    },

    //optimistic update
    onMutate: async ({details}) => {
      await queryClient.cancelQueries({queryKey: ["instrumentDetails"]});

      const previousDetails = queryClient.getQueryData(["instrumentDetails"]);

      const optimisticInstrument = {
        id: `temp-${Date.now()}`,
        ...details,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["instrumentDetails"], (old = []) => [
        ...old,
        optimisticInstrument,
      ])

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["instrumentDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["instrumentDetails"]});
    }
  })
}



// Update an existing instrument
export const updateInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .update(details)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // optimistic update
    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["instrumentDetails", id] });

      const previousDetails = queryClient.getQueryData(["instrumentDetails", id]);

      queryClient.setQueryData(["instrumentDetails", id], (old = []) =>
        old.map((instrument) =>
          instrument.id === id
            ? { ...instrument, ...details }
            : instrument
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["instrumentDetails", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instrumentDetails", variables.id] });
    },
  });
};


// Delete an instrument
export const deleteInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("music")
        .from("instrument_details")
        .delete()
        .eq("id", id);
      
      if (error) throw new Error(error.message);
    },

    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries(["instrumentDetails"]);

      const previousDetails = queryClient.getQueryData(["instrumentDetails"]);

      queryClient.setQueryData(["instrumentDetails"], (old = []) => 
        old.filter((instrument) => instrument.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["instrumentDetails"], context.previousDetails);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["instrumentDetails"]);
    },
  });
};