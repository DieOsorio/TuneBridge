import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { supabase } from '../../supabase';

export interface PostImageUploadParams {
  file: File;
  userId: string;
  postId: string;
  filename: string;
}

export interface PostImageDeleteParams {
  userId: string;
  postId: string;
  filename: string;
}

export interface OptimisticImage {
  id: string;
  url: string;
  created_at: string;
  userId: string;
  postId: string;
  filename: string;
}

// upload images to the bucket and return their publicUrl
export const useUploadPostImages = (): UseMutationResult<string | null, Error, PostImageUploadParams, { previousDetails?: any }> => {
  const queryClient = useQueryClient();
  return useMutation<string | null, Error, PostImageUploadParams, { previousDetails?: any }>({
    mutationFn: async ({ file, userId, postId, filename }) => {
      const filePath = `${userId}/${postId}/${filename}`;
      const { data, error } = await supabase
        .storage
        .from('post-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
      if (error) throw new Error(error.message);
      const { data: publicUrlData } = supabase
        .storage
        .from('post-media')
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        console.warn("getPublicUrl did not return a valid publicUrl", publicUrlData);
        return null;
      }
      return publicUrlData.publicUrl;
    },
    onMutate: async ({ file, userId, postId, filename }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousDetails = queryClient.getQueryData(["posts"]);
      const optimisticData: OptimisticImage = {
        id: `temp-${Date.now()}`,
        url: URL.createObjectURL(file),
        created_at: new Date().toISOString(),
        userId,
        postId,
        filename,
      };
      queryClient.setQueryData(["posts"], (old: OptimisticImage[] = []) => [
        ...old,
        optimisticData,
      ]);
      return { previousDetails };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["posts"], context.previousDetails);
      }
    },
    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// Delete images from the post (post-media bucket)
export const useDeletePostImages = (): UseMutationResult<string, Error, PostImageDeleteParams, { previousDetails?: any }> => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, PostImageDeleteParams, { previousDetails?: any }>({
    mutationFn: async ({ userId, postId, filename }) => {
      const filePath = `${userId}/${postId}/${filename}`;
      const { error } = await supabase
        .storage
        .from('post-media')
        .remove([filePath]);
      if (error) throw new Error(`Delete failed: ${error.message}`);
      return filePath;
    },
    onMutate: async ({ userId, postId, filename }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousDetails = queryClient.getQueryData(["posts"]);
      queryClient.setQueryData(["posts"], (old: any[] = []) =>
        old.map((post) =>
          post.id === postId
            ? {
                ...post,
                images_url: Array.isArray(post.images_url)
                  ? post.images_url.filter((image: string) => image !== filename)
                  : post.images_url,
              }
            : post
        )
      );
      return { previousDetails };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["posts"], context.previousDetails);
      }
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.postId) {
        queryClient.invalidateQueries({ queryKey: ["posts", variables.postId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      }
    },
  });
};
