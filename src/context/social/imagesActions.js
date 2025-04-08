import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// upload images to the bucket and return their publicUrl
export const useUploadPostImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async({file, userId, postId, filename}) => {
            const filePath = `${userId}/${postId}/${filename}`
            const { data, error } = await supabase
            .storage
            .from('post-media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
            });
                
            if (error) throw new Error(error.message);

            const {data: publicUrlData, error: urlError} = supabase
            .storage
            .from('post-media')
            .getPublicUrl(filePath);

            if (urlError) throw new Error(`Get public URL failed: ${urlError.message}`);

            if (!publicUrlData?.publicUrl) {
                console.warn("getPublicUrl did not return a valid publicUrl", publicUrlData);
                return null;
            }

            return publicUrlData.publicUrl;
        },
    
        //optimistic update
        onMutate: async ({ file, userId, postId, filename}) => {
          await queryClient.cancelQueries({queryKey: ["posts"]});
    
          const previousDetails = queryClient.getQueryData(["posts"]);
    
          const optimisticData = {
            id: `temp-${Date.now()}`,
            url: URL.createObjectURL(file),
            created_at: new Date().toISOString(),
            userId,
            postId,
            filename,
          };
    
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
  };

// Delete images from the post (post-media bucket)
export const useDeletePostImages = () => {
const queryClient = useQueryClient();

return useMutation({
    mutationFn: async ({ userId, postId, filename }) => {
    const filePath = `${userId}/${postId}/${filename}`;
    
    // Eliminando el archivo del bucket de Supabase
    const { error } = await supabase
        .storage
        .from('post-media')
        .remove([filePath]); // El remove espera un array de rutas de archivo a eliminar

    if (error) throw new Error(`Delete failed: ${error.message}`);

    return filePath; // Devuelvo la ruta del archivo eliminado para referencia
    },

    // Optimistic update (si es necesario)
    onMutate: async ({ userId, postId, filename }) => {
    await queryClient.cancelQueries({ queryKey: ["posts"] });

    const previousDetails = queryClient.getQueryData(["posts"]);

    // Establezco el estado optimista (puedes ajustar esto si es necesario)
    queryClient.setQueryData(["posts"], (old = []) =>
        old.map((post) =>
        post.id === postId
            ? {
                ...post,
                images_url: post.images_url?.filter((image) => image !== filename), // Elimino la URL de la imagen
            }
            : post
        )
    );

    return { previousDetails };
    },

    onError: (err, _variables, context) => {
    if (context?.previousDetails) {
        queryClient.setQueryData(["posts"], context.previousDetails);
    }
    },

    onSettled: (_data, _error, { postId }) => {
    // Invalidamos las queries relacionadas con los posts después de la eliminación
    queryClient.invalidateQueries({ queryKey: ["posts", postId] });
    }
});
};
  