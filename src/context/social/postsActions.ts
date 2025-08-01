import { 
  useQuery, 
  useInfiniteQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryResult, 
  UseMutationResult, 
  UseInfiniteQueryResult, 
  InfiniteData
} from "@tanstack/react-query";
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
  group_id: string | null;
  images_urls?: string[];
  updated_at: string;
  created_at: string;
  content: string;
  title: string;
  [key: string]: any;
}


const toPostEntity = (p: Partial<Post>): Post => ({
  id: p.id ?? `temp-${Date.now()}`,
  profile_id: p.profile_id ?? "",
  group_id: p.group_id ?? null,
  updated_at: p.updated_at ?? "",
  created_at: p.created_at ?? "",
  content: p.content ?? "",
  title: p.title ?? "",
  images_urls: p.images_urls ?? [],
  ...p,
});

export const useInfiniteUserPostsQuery = (
  profileId: string,
  limit = 10
): UseInfiniteQueryResult<InfiniteData<Post[]>, Error> => {
  return useInfiniteQuery<Post[], Error>({
    queryKey: postKeyFactory({ profileId }).user ?? ["userPosts", profileId ?? ""],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === "number" ? pageParam : Number(pageParam);
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data.map(toPostEntity) : [];
    },
    enabled: !!profileId,
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length === limit ? allPages.length : undefined,
  });
};



export const useInfinitePostsQuery = (limit = 10): UseInfiniteQueryResult<InfiniteData<Post[]>, Error> => {
  return useInfiniteQuery<Post[], Error>({
    queryKey: postKeyFactory().infinite ?? ["infinitePosts"],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const page = typeof pageParam === "number" ? pageParam : Number(pageParam);
      const from = page * limit;
      const to = from + limit - 1;
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, to);
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data.map(toPostEntity) : [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage)) {
        console.warn("lastPage no es array", lastPage);
        return undefined;
      }
      if (!Array.isArray(allPages)) {
        console.warn("allPages no es array", allPages);
        return undefined;
      }
      return lastPage.length === limit ? allPages.length : undefined;
    },
  });
};

export const useSearchPostsQuery = (searchTerm: string): UseQueryResult<Post[], Error> => {
  return useQuery<Post[], Error>({
    queryKey: postKeyFactory({ searchTerm }).search ?? ["searchPosts", searchTerm ?? ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .select("*")
        .textSearch("content_search", searchTerm, {
          type: "websearch",
        });
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? data.map(toPostEntity) : [];
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
      return toPostEntity(data);
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
      return Array.isArray(data) ? data.map(toPostEntity) : [];
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
      return Array.isArray(data) ? data.map(toPostEntity) : [];
    },
    enabled: !!profileId,
  });
};

export const useCreatePostMutation = (): UseMutationResult<Post, Error, Partial<Post>> => {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, Partial<Post>>({
    mutationFn: async (post) => {
      const { data, error } = await supabase
        .schema("social")
        .from("posts")
        .insert(post)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return toPostEntity(data);
    },
    onMutate: async (post) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }),
        entity: toPostEntity(post),
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
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }),
        entity: toPostEntity(variables),
        newEntity: newPost,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ profileId: entity.profile_id }),
        entity: toPostEntity(variables),
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
      return toPostEntity(data);
    },
    onMutate: async ({ id, updatedPost }) =>
      optimisticUpdate({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }),
        entity: toPostEntity({ ...updatedPost, id }),
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
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }),
        entity: toPostEntity({ ...variables.updatedPost, id: variables.id }),
        newEntity: newPost,
      }),
    onSettled: (_data, _error, variables) =>
      invalidateKeys({
        queryClient,
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }),
        entity: toPostEntity({ ...variables.updatedPost, id: variables.id }),
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
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }),
        entity: toPostEntity({ id }),
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
        keyFactory: (entity: Post) => postKeyFactory({ postId: entity.id }),
        entity: toPostEntity({ id: variables }),
      }),
  });
};
