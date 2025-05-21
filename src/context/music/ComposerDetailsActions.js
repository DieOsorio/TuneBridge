import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Fetch all composer details for a given roleId
export const useFetchComposersQuery = (roleId) => {
  return useQuery({
    queryKey: ["composerDetailsList", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch single composer detail by id
export const useFetchComposerById = (id) => {
  return useQuery({
    queryKey: ["composerDetails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new composer
export const useAddComposerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ details }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticComposer = {
        id: tempId,
        ...details,
        created_at: new Date().toISOString(),
      };

      // Cache individual composer
      queryClient.setQueryData(["composerDetails", tempId], optimisticComposer);

      // Cache list of composers for role
      queryClient.setQueryData(["composerDetailsList", details.role_id], (old = []) => [
        ...old,
        optimisticComposer,
      ]);

      return { tempId, roleId: details.role_id };
    },

    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["composerDetails", context.tempId] });
        queryClient.setQueryData(["composerDetailsList", context.roleId], (old = []) =>
          old.filter((item) => item.id !== context.tempId)
        );
      }
    },

    onSuccess: (data, _variables, context) => {
      const realId = data.id;
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["composerDetails", context.tempId] });
        queryClient.setQueryData(["composerDetailsList", context.roleId], (old = []) =>
          old.map((item) => (item.id === context.tempId ? data : item))
        );
      }
      queryClient.setQueryData(["composerDetails", realId], data);
    },

    onSettled: (data) => {
      if (data?.role_id) {
        queryClient.invalidateQueries(["composerDetailsList", data.role_id]);
      }
    },
  });
};

// Update composer
export const useUpdateComposerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries(["composerDetails", id]);

      const previous = queryClient.getQueryData(["composerDetails", id]);
      queryClient.setQueryData(["composerDetails", id], (old = {}) => ({ ...old, ...details }));

      return { previous, id };
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["composerDetails", context.id], context.previous);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["composerDetails", variables.id]);
      if (_data?.role_id) {
        queryClient.invalidateQueries(["composerDetailsList", _data.role_id]);
      }
    },
  });
};

// Delete composer
export const useDeleteComposerMutation = () => {
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

    onMutate: async ({ id, roleId }) => {
      await queryClient.cancelQueries(["composerDetailsList", roleId]);
      await queryClient.cancelQueries(["composerDetails", id]);

      const previousList = queryClient.getQueryData(["composerDetailsList", roleId]);

      queryClient.setQueryData(["composerDetailsList", roleId], (old = []) =>
        old.filter((composer) => composer.id !== id)
      );

      queryClient.removeQueries({ queryKey: ["composerDetails", id] });

      return { previousList, roleId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["composerDetailsList", context.roleId], context.previousList);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["composerDetailsList", variables.roleId]);
    },
  });
};
