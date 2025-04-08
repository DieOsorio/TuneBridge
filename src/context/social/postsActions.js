import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH ALL POSTS FOR A PROFILE
export const fetchPostsQuery = (profileId) => {
    const key = profileId ? ["posts", profileId] : ["posts"];
  
    return useQuery({
      queryKey: key,
      queryFn: async () => {
        let query = supabase
          .schema("social")
          .from("posts")
          .select("*");
  
        if (profileId) {
          query = query.eq("profile_id", profileId);
        }
  
        const { data, error } = await query;
  
        if (error) throw new Error(error.message);
        return data;
      },
    });
  };  
  


// CREATE NEW POST
export const createPostMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async(post) => {
        const { data, error}= await supabase
        .schema("social")
        .from("posts")
        .insert(post)
        .select();
        
        if (error) throw new Error(error.message);
        return data[0];
      },
  
      //optimistic update
      onMutate: async ( post ) => {
        await queryClient.cancelQueries({queryKey: ["posts"]});
  
        const previousDetails = queryClient.getQueryData(["posts"]);
  
        const optimisticData = {
          id: `temp-${Date.now()}`,
          ...post,
          created_at: new Date().toISOString(),
        }
  
        queryClient.setQueryData(["posts"], (old = []) => [
          ...old,
          optimisticData,
        ])
  
        return { previousDetails};
      },
  
      onError: (err, _variables, context) => {
        if (context?.previousDetails) {
          queryClient.setQueryData(["posts"], context.previousDetails);
        }
      },
  
      onSettled: (_data, _error) => {
        queryClient.invalidateQueries({ queryKey: ["posts"]});
      }
    })
  }


  // UPDATE POST
export const updatePostMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ({id, updatedPost}) => {
        const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .update(updatedPost)
        .eq("id", id)
        .select()
        
        if (error) throw new Error(error.message)
        return data[0]
      },
  
       // optimistic update
       onMutate: async ({ id, updatedPost }) => {
        await queryClient.cancelQueries({ queryKey: ["posts", id] });
  
        const previousDetails = queryClient.getQueryData(["posts", id]);
  
        queryClient.setQueryData(["posts", id], (old = []) =>
          old.map((post) =>
            post.id === id
              ? { ...post, ...updatedPost }
              : post
          )
        );
  
        return { previousDetails };
      },
  
      onError: (err, _variables, context) => {
        if (context?.previousDetails) {
          queryClient.setQueryData(
            ["posts", _variables.id],
            context.previousDetails
          );
        }
      },
  
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({ queryKey: ["posts", variables.id] });
      },
    })
  }


  // DELETE POST
export const deletePostMutation = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: async ( id ) => {
        const { error } = await supabase
          .schema("social")
          .from("posts")
          .delete()
          .eq("id", id);
        
        if (error) throw new Error(error.message);
      },
  
      // optimistic update
      onMutate: async ( id ) => {
        await queryClient.cancelQueries({ queryKey: ["posts"] });
  
        const previousDetails = queryClient.getQueryData(["posts"]);
  
        queryClient.setQueryData(["posts"], (old = []) =>
          old.filter((dj) => dj.id !== id)
        );
  
        return { previousDetails };
      },
  
      onError: (err, _variables, context) => {
        if (context?.previousDetails) {
          queryClient.setQueryData(["posts"], context.previousDetails);
        }
      },
  
      onSettled: (_data, _error) => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    })
  } 