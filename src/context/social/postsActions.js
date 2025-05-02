import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// FETCH A SINGLE POST
export const useFetchPostQuery = (postId) => {
  return useQuery({
    queryKey: ["post", postId], // Ensure the queryKey is unique for each post
    queryFn: async () => {
      if (!postId) throw new Error("postId is required"); // Ensure postId is provided

      const { data, error } = await supabase
        .schema("social")
        .from("posts") // Query the "posts" table
        .select("*")
        .eq("id", postId) // Filter by postId
        .single(); // Fetch a single post

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!postId, // Only run the query if postId is defined
  });
};

// FETCH ALL POSTS FOR A PROFILE
export const useFetchPostsQuery = () => {
    return useQuery({
      queryKey: ["posts"],
      queryFn: async () => {
        const { data, error } = await supabase
          .schema("social")
          .from("posts")
          .select("*");
  
        if (error) throw new Error(error.message);
        return data;
      },
    });
  };
  
  
// FETCH USER POSTS
export const useUserPostsQuery = (profileId) => {
    return useQuery({
      queryKey: ["userPosts", profileId],
      queryFn: async () => {
        const { data, error } = await  supabase
          .schema("social")
          .from("posts")
          .select("*")
          .eq("profile_id", profileId);        
  
        if (error) throw new Error(error.message);
        return data;
      },
      enabled: !!profileId
    });
  };  
  


// CREATE NEW POST
export const useCreatePostMutation = () => {
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
  
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({ queryKey: ["posts"]});
        queryClient.invalidateQueries({ queryKey: ["userPosts", variables.profile_id]});
      }
    })
  }


// UPDATE POST
export const useUpdatePostMutation = () => {
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
        queryClient.invalidateQueries({ queryKey: ["userPosts", variables.profile_id]});
      },
    })
  }


// DELETE POST
export const useDeletePostMutation = () => {
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
          old.filter((post) => post.id !== id)
        );
  
        return { previousDetails };
      },
  
      onError: (err, _variables, context) => {
        if (context?.previousDetails) {
          queryClient.setQueryData(["posts"], context.previousDetails);
        }
      },
  
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["userPosts", variables.profile_id]});
      },
    })
  }