import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL COMPOSER DETAILS FOR A PROFILE
export const fetchComposerQuery = (roleId) => {
  return useQuery({
    queryKey: ["composerDetails", roleId],
    queryFn: async() => {
      if (!roleId) {
        console.error("roleId is not valid");
        return [];
      }
      const { data, error } = await supabase
      .schema("music")
      .from("composer_details")
      .select("*")
      .eq("role_id", roleId)

      if (error) throw new Error(error.message)
      return data;
    },
    enabled: !!roleId,
  })
}


// ADD NEW COMPOSER INFORMATION
export const addComposerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({details}) => {
      const { data, error}= await supabase
      .schema("music")
      .from("composer_details")
      .insert(details)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ({ details }) => {
      await queryClient.cancelQueries({queryKey: ["composerDetails"]});

      const previousDetails = queryClient.getQueryData(["composerDetails"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...details,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["composerDetails"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["composerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["composerDetails"]});
    }
  })
}


// UPDATE AN EXISTING COMPOSER INFO
export const updateComposerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, details}) => {
      const { data, error } = await supabase
      .schema("music")
      .from("composer_details")
      .update(details)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["composerDetails", id] });

      const previousDetails = queryClient.getQueryData(["composerDetails", id]);

      queryClient.setQueryData(["composerDetails", id], (old = []) =>
        old.map((composer) =>
          composer.id === id
            ? { ...composer, ...details }
            : composer
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["composerDetails", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["composerDetails", variables.id] });
    },
  })
}


// DELETE A COMPOSER
export const deleteComposerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("composer_details")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["composerDetails"] });

      const previousDetails = queryClient.getQueryData(["composerDetails"]);

      queryClient.setQueryData(["composerDetails"], (old = []) =>
        old.filter((composer) => composer.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["composerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["composerDetails"] });
    },
  })
} 
