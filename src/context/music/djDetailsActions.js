import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL DJ DETAILS FOR A PROFILE
export const fetchDjQuery = (roleId) => {
  return useQuery({
    queryKey: ["djDetails", roleId],
    queryFn: async() => {
      if (!roleId) {
        console.error("roleId is not valid");
        return [];
      }
      const { data, error } = await supabase
      .schema("music")
      .from("dj_details")
      .select("*")
      .eq("role_id", roleId)

      if (error) throw new Error(error.message)
      return data;
    },
    enabled: !!roleId,
  })
}


// ADD NEW DJ INFORMATION
export const addDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({details}) => {
      const { data, error}= await supabase
      .schema("music")
      .from("dj_details")
      .insert(details)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ({ details }) => {
      await queryClient.cancelQueries({queryKey: ["djDetails"]});

      const previousDetails = queryClient.getQueryData(["djDetails"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...details,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["djDetails"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["djDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["djDetails"]});
    }
  })
}


// UPDATE AN EXISTING DJ INFO
export const updateDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, details}) => {
      const { data, error } = await supabase
      .schema("music")
      .from("dj_details")
      .update(details)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["djDetails", id] });

      const previousDetails = queryClient.getQueryData(["djDetails", id]);

      queryClient.setQueryData(["djDetails", id], (old = []) =>
        old.map((dj) =>
          dj.id === id
            ? { ...dj, ...details }
            : dj
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["djDetails", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["djDetails", variables.id] });
    },
  })
}

// DELETE A DJ
export const deleteDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("dj_details")
        .delete()
        .eq("id", id);
      console.log("id en delete fn:", id);
      
      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["djDetails"] });

      const previousDetails = queryClient.getQueryData(["djDetails"]);

      queryClient.setQueryData(["djDetails"], (old = []) =>
        old.filter((dj) => dj.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["djDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["djDetails"] });
    },
  })
} 