import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL PRODUCER DETAILS FOR A PROFILE
export const fetchProducerQuery = (roleId) => {
  return useQuery({
    queryKey: ["producerDetails", roleId],
    queryFn: async() => {
      if (!roleId) {
        console.error("roleId is not valid");
        return [];
      }
      const { data, error } = await supabase
      .schema("music")
      .from("producer_details")
      .select("*")
      .eq("role_id", roleId)

      if (error) throw new Error(error.message)
      return data;
    },
    enabled: !!roleId,
  })
}


// ADD NEW PRODUCER INFORMATION
export const addProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({details}) => {
      const { data, error}= await supabase
      .schema("music")
      .from("producer_details")
      .insert(details)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ({ details }) => {
      await queryClient.cancelQueries({queryKey: ["producerDetails"]});

      const previousDetails = queryClient.getQueryData(["producerDetails"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...details,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["producerDetails"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["producerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["producerDetails"]});
    }
  })
}


// UPDATE AN EXISTING PRODUCER INFO
export const updateProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, details}) => {
      const { data, error } = await supabase
      .schema("music")
      .from("producer_details")
      .update(details)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["producerDetails", id] });

      const previousDetails = queryClient.getQueryData(["producerDetails", id]);

      queryClient.setQueryData(["producerDetails", id], (old = []) =>
        old.map((producer) =>
          producer.id === id
            ? { ...producer, ...details }
            : producer
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["producerDetails", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["producerDetails", variables.id] });
    },
  })
}

{}
// DELETE A PRODUCER
export const deleteProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("producer_details")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["producerDetails"] });

      const previousDetails = queryClient.getQueryData(["producerDetails"]);

      queryClient.setQueryData(["producerDetails"], (old = []) =>
        old.filter((producer) => producer.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["producerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["producerDetails"] });
    },
  })
} 