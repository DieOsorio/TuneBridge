import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL SINGER DETAILS FOR A PROFILE
export const fetchSingerQuery = (roleId) => {
  return useQuery({
    queryKey: ["singerDetails", roleId],
    queryFn: async() => {
      if (!roleId) {
        console.error("roleId is not valid");
        return [];
      }
      const { data, error } = await supabase
      .schema("music")
      .from("singer_details")
      .select("*")
      .eq("role_id", roleId)

      if (error) throw new Error(error.message)
      return data;
    },
    enabled: !!roleId,
  })
}

// ADD NEW SINGER INFORMATION
export const addSingerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async({details}) => {
      const { data, error}= await supabase
      .schema("music")
      .from("singer_details")
      .insert(details)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ({ details }) => {
      await queryClient.cancelQueries({queryKey: ["singerDetails"]});

      const previousDetails = queryClient.getQueryData(["singerDetails"]);

      const optimisticSinger = {
        id: `temp-${Date.now()}`,
        ...details,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["singerDetails"], (old = []) => [
        ...old,
        optimisticSinger,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["singerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["singerDetails"]});
    }
  })
}

// UPDATE AN EXISTING SINGER
export const updateSingerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, details}) => {
      const { data, error } = await supabase
      .schema("music")
      .from("singer_details")
      .update(details)
      .eq("id", id)
      .select()
      console.log(data);
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries({ queryKey: ["singerDetails", id] });

      const previousDetails = queryClient.getQueryData(["singerDetails", id]);

      queryClient.setQueryData(["singerDetails", id], (old = []) =>
        old.map((singer) =>
          singer.id === id
            ? { ...singer, ...details }
            : singer
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["singerDetails", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["singerDetails", variables.id] });
    },
  })
}

// DELETE A SINGER
export const deleteSingerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("singer_details")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["singerDetails"] });

      const previousDetails = queryClient.getQueryData(["singerDetails"]);

      queryClient.setQueryData(["singerDetails"], (old = []) =>
        old.filter((singer) => singer.id !== id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["singerDetails"], context.previousDetails);
      }
    },

    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["singerDetails"] });
    },
  })
} 
