import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';

import { postKeyFactory } from "../helpers/social/socialKeys";
import { 
  optimisticUpdate, 
  rollbackCache, 
  invalidateKeys, 
  replaceOptimisticItem } from "../helpers/cacheHandler";

// INFINITE SCROLL FOR ALL POSTS AND USER POSTS
const PAGE_SIZE = 8; // Number of posts to fetch per page

export const useInfiniteUserPostsQuery = (profileId) => {
  return useInfiniteQuery({
    queryKey: postKeyFactory({ profileId }).user,
    queryFn: async ({ pageParam = 0 }) => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      return data;
    },
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
};

export const useInfinitePostsQuery = () => {
  return useInfiniteQuery({
    queryKey: postKeyFactory().infinite,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
};


// SEARCH POSTS
export const useSearchPostsQuery = (searchTerm) => {
  return useQuery({
    queryKey: postKeyFactory({ searchTerm }).search,
    queryFn: async () => {
      if (!searchTerm) return []; 

      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .textSearch("content_search", searchTerm, {
          type: "websearch",
        });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!searchTerm,
  });
};


// FETCH A SINGLE POST
export const useFetchPostQuery = (postId) => {
  return useQuery({
    queryKey: postKeyFactory({ postId }).single, // Ensure the queryKey is unique for each post
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
    queryKey: postKeyFactory().all,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .order("updated_at", { ascending: false }); // Order by updated_at (most recent first)

      if (error) throw new Error(error.message);
      return data;
    },
  });
};


// FETCH USER POSTS
export const useUserPostsQuery = (profileId) => {
  return useQuery({
    queryKey: postKeyFactory({ profileId }).user,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("profile_id", profileId) // Filter by profile_id
        .order("updated_at", { ascending: false }); // Order by updated_at (most recent first)

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId, // Only run the query if profileId is defined
  });
};


// CREATE NEW POST
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async(post) => {
      console.log("Creating post:", post);
      
      const { data, error}= await supabase
        .schema("social")
        .from("posts")
        .insert(post)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },
    onMutate: async (post) => {
      return optimisticUpdate({
        queryClient,
        queryKey: postKeyFactory({ profileId: post.profile_id }).user,
        entity: { ...post, profileId: post.profile_id },
        type: "add",
      });
    },
    onError: (err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newPost, variables) => {
      replaceOptimisticItem({
        queryClient,
        queryKey: postKeyFactory({ profileId: variables.profile_id }).user,
        optimisticEntity: variables,
        realEntity: newPost,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: postKeyFactory({ profileId: variables.profile_id }).user,
      });
    },
  });
};

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
        .select();
      if (error) throw new Error(error.message)
      return data[0]
    },
    onMutate: async ({ id, updatedPost }) => {
      return optimisticUpdate({
        queryClient,
        queryKey: postKeyFactory({ postId: id }).single,
        entity: { postId: id, ...updatedPost },
        type: "update",
      });
    },
    onError: (err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSuccess: (newPost, variables) => {
      replaceOptimisticItem({
        queryClient,
        queryKey: postKeyFactory({ postId: variables.id }).single,
        optimisticEntity: variables,
        realEntity: newPost,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: postKeyFactory({ postId: variables.id }).single,
      });
    },
  });
};

// DELETE POST
export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("social")
        .from("posts")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      return optimisticUpdate({
        queryClient,
        queryKey: postKeyFactory({ postId: id }).single,
        entity: { postId: id },
        type: "remove",
      });
    },
    onError: (err, variables, context) => {
      rollbackCache({
        queryClient,
        previousData: context,
      });
    },
    onSettled: (_data, _error, variables) => {
      invalidateKeys({
        queryClient,
        queryKey: postKeyFactory({ postId: variables }).single,
      });
    },
  });
};