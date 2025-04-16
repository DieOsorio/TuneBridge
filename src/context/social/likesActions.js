import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH ALL LIKES
export const useFetchLikesQuery = () => {
  return useQuery({
    queryKey: ["likes"],
    queryFn: async() => {
      const {data, error}= await supabase
      .schema("social")
      .from("likes")
      .select("*");
      
      if (error) throw new Error(error.message);
      return data;
    }
  })
}

// FETCH USER LIKES
export const useUserLikesQuery = (profile_id) => {
  return useQuery({
    queryKey: ["userLikes", profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("likes")
        .select("*")
        .eq("profile_id", profile_id);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profile_id
  });
}


// INSERT NEW LIKE
export const useInsertLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async(like) => {
      const { data, error} = await supabase
      .schema("social")
      .from("likes")
      .insert(like)
      .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ( like ) => {
      await queryClient.cancelQueries({queryKey: ["likes"]});

      const previousDetails = queryClient.getQueryData(["likes"]);

      const optimisticData = {
        id: `temp-${Date.now()}`,
        ...like,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(["likes"], (old = []) => [
        ...old,
        optimisticData,
      ])

      return { previousDetails};
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["likes"], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.profile_id] });
    }
  })
}

// UPDATE LIKE
export const useUpdateLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, updatedLike}) => {
      const { data, error } = await supabase
      .schema("social")
      .from("likes")
      .update(updatedLike)
      .eq("id", id)
      .select()
      
      if (error) throw new Error(error.message)
      return data[0]
    },

     // optimistic update
     onMutate: async ({ id, updatedLike }) => {
      await queryClient.cancelQueries({ queryKey: ["likes", id] });

      const previousDetails = queryClient.getQueryData(["likes", id]);

      queryClient.setQueryData(["likes", id], (old = []) =>
        old.map((l) =>
          l.id === id
            ? { ...l, ...updatedLike }
            : l
        )
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["likes", _variables.id],
          context.previousDetails
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.profile_id] });
    },
  })
}

// DELETE LIKE
export const useDeleteLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ( like ) => {
      const { error } = await supabase
        .schema("social")
        .from("likes")
        .delete()
        .eq("id", like.id);
      
      if (error) throw new Error(error.message);
    },

    // optimistic update
    onMutate: async ( like ) => {
      await queryClient.cancelQueries({ queryKey: ["likes"] });

      const previousDetails = queryClient.getQueryData(["likes"]);

      queryClient.setQueryData(["likes"], (old = []) =>
        old.filter((l) => l.id !== like.id)
      );

      return { previousDetails };
    },

    onError: (err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["likes"], context.previousDetails);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["likes"] });
      queryClient.invalidateQueries({ queryKey: ["userLikes", variables.profile_id] });
    },
  })
} 