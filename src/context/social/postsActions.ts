import { useQuery, useInfiniteQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult, UseInfiniteQueryResult } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { postKeyFactory } from "../helpers/social/socialKeys";
import { 
  optimisticUpdate, 
  rollbackCache, 
  invalidateKeys, 
  replaceOptimisticItem 
} from "../helpers/cacheHandler";

export interface Post {
  id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  content?: string;
  [key: string]: any;
}

const PAGE_SIZE = 8;

export const useInfiniteUserPostsQuery = (profileId: string): UseInfiniteQueryResult<Post[], Error> => {
  return useInfiniteQuery<Post[], Error, Post[], string[]>({
    queryKey: postKeyFactory({ profileId }).user ?? ["userPosts", profileId ?? ""],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === "number" ? pageParam : Number(pageParam);
      if (!profileId) return [];
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      // Ensure each item matches Post type
      return Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id ?? "",
            profile_id: item.profile_id ?? "",
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? "",
            content: item.content ?? "",
            ...item
          }))
        : [];
    },
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
};

export const useInfinitePostsQuery = (): UseInfiniteQueryResult<Post[], Error> => {
  return useInfiniteQuery<Post[], Error, Post[], string[]>({
    queryKey: postKeyFactory().infinite ?? ["infinitePosts"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === "number" ? pageParam : Number(pageParam);
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      // Ensure each item matches Post type
      return Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id ?? "",
            profile_id: item.profile_id ?? "",
            created_at: item.created_at ?? "",
            updated_at: item.updated_at ?? "",
            content: item.content ?? "",
            ...item
          }))
        : [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
};

export const useSearchPostsQuery = (searchTerm: string): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: postKeyFactory({ searchTerm }).search ?? ["searchPosts", searchTerm ?? ""],
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
      return Array.isArray(data) ? data : [];
    },
    enabled: !!searchTerm,
  });
};

export const useFetchPostQuery = (postId: string): UseQueryResult<Post, Error> => {
  return useQuery<Post, Error>({
    queryKey: postKeyFactory({ postId }).single ?? ["post", postId ?? ""],
    queryFn: async () => {
      if (!postId) throw new Error("postId is required");
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();
      if (error) throw new Error(error.message);
      return data as Post;
    },
    enabled: !!postId,
  });
};

export const useFetchPostsQuery = (): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: postKeyFactory().all ?? ["allPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
  });
};

export const useUserPostsQuery = (profileId: string): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: postKeyFactory({ profileId }).user ?? ["userPosts", profileId ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("profile_id", profileId)
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!profileId,
  });
};

export const useCreatePostMutation = (): UseMutationResult<Post, Error, Partial<Post>> => {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, Partial<Post>>({
    mutationFn: async(post) => {
      const { data, error }= await supabase
        .schema("social")
        .from("posts")
        .insert(post)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Post;
    },
    onMutate: async (post) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }) ?? { user: ["userPosts", entity.profile_id ?? ""] },
        entity: {
          ...post,
          profile_id: post.profile_id ?? "",
          id: post.id ?? "",
          created_at: post.created_at ?? "",
          updated_at: post.updated_at ?? "",
          content: post.content ?? ""
        },
        type: "add",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSuccess: (newPost, variables) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }) ?? { user: ["userPosts", entity.profile_id ?? ""] },
        entity: { ...variables, profile_id: variables.profile_id ?? "", id: variables.id ?? "", created_at: variables.created_at ?? "", updated_at: variables.updated_at ?? "" },
        newEntity: newPost,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }) ?? { user: ["userPosts", entity.profile_id ?? ""] },
        entity: { ...variables, profile_id: variables.profile_id ?? "", id: variables.id ?? "", created_at: variables.created_at ?? "", updated_at: variables.updated_at ?? "" },
      }),
  });
};

export const useUpdatePostMutation = (): UseMutationResult<Post, Error, { id: string; updatedPost: Partial<Post> }> => {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, { id: string; updatedPost: Partial<Post> }>({
    mutationFn: async ({id, updatedPost}) => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .update(updatedPost)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Post;
    },
    onMutate: async ({ id, updatedPost }) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }) ?? { single: ["post", entity.id ?? ""] },
        entity: {
          ...updatedPost,
          id: id ?? "",
          profile_id: updatedPost.profile_id ?? "",
          created_at: updatedPost.created_at ?? "",
          updated_at: updatedPost.updated_at ?? "",
          content: updatedPost.content ?? ""
        },
        type: "update",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSuccess: (newPost, variables) =>
      replaceOptimisticItem({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }) ?? { single: ["post", entity.id ?? ""] },
        entity: {
          ...variables.updatedPost,
          id: variables.id ?? "",
          profile_id: variables.updatedPost.profile_id ?? "",
          created_at: variables.updatedPost.created_at ?? "",
          updated_at: variables.updatedPost.updated_at ?? "",
          content: variables.updatedPost.content ?? ""
        },
        newEntity: newPost,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }) ?? { single: ["post", entity.id ?? ""] },
        entity: {
          ...variables.updatedPost,
          id: variables.id ?? "",
          profile_id: variables.updatedPost.profile_id ?? "",
          created_at: variables.updatedPost.created_at ?? "",
          updated_at: variables.updatedPost.updated_at ?? "",
          content: variables.updatedPost.content ?? ""
        },
      }),
  });
};

export const useDeletePostMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("social")
        .from("posts")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }) ?? { single: ["post", entity.id ?? ""] },
        entity: { id: id ?? "", profile_id: "", created_at: "", updated_at: "", content: "" },
        type: "remove",
      }),
    onError: (_err, variables, context) =>
      rollbackCache({
        queryClient,
        previousData: context as Record<string, unknown>,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }) ?? { single: ["post", entity.id ?? ""] },
        entity: { id: variables ?? "", profile_id: "", created_at: "", updated_at: "", content: "" },
      }),
  });
};
