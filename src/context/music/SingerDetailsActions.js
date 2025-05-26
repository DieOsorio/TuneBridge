import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Fetch all singer details for a given roleId
export const useFetchSingersQuery = (roleId) => {
  return useQuery({
    queryKey: ["singerDetailsList", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch single singer detail by id
export const useFetchSingerById = (id) => {
  return useQuery({
    queryKey: ["singerDetails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new singer
export const useAddSingerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ details }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticSinger = {
        id: tempId,
        ...details,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["singerDetails", tempId], optimisticSinger);

      queryClient.setQueryData(["singerDetailsList", details.role_id], (old = []) => [
        ...old,
        optimisticSinger,
      ]);

      return { tempId, roleId: details.role_id };
    },

    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["singerDetails", context.tempId] });
        queryClient.setQueryData(["singerDetailsList", context.roleId], (old = []) =>
          old.filter((item) => item.id !== context.tempId)
        );
      }
    },

    onSuccess: (data, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["singerDetails", context.tempId] });
        queryClient.setQueryData(["singerDetailsList", context.roleId], (old = []) =>
          old.map((item) => (item.id === context.tempId ? data : item))
        );
      }
      queryClient.setQueryData(["singerDetails", data.id], data);
    },

    onSettled: (data) => {
      if (data?.role_id) {
        queryClient.invalidateQueries(["singerDetailsList", data.role_id]);
      }
    },
  });
};

// Update singer
export const useUpdateSingerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries(["singerDetails", id]);
      const previous = queryClient.getQueryData(["singerDetails", id]);

      queryClient.setQueryData(["singerDetails", id], (old = {}) => ({
        ...old,
        ...details,
      }));

      return { previous, id };
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["singerDetails", context.id], context.previous);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["singerDetails", variables.id]);
      if (_data?.role_id) {
        queryClient.invalidateQueries(["singerDetailsList", _data.role_id]);
      }
    },
  });
};

// Delete singer
export const useDeleteSingerMutation = () => {
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

    onMutate: async ({ id, roleId }) => {
      await queryClient.cancelQueries(["singerDetailsList", roleId]);
      await queryClient.cancelQueries(["singerDetails", id]);

      const previousList = queryClient.getQueryData(["singerDetailsList", roleId]);

      queryClient.setQueryData(["singerDetailsList", roleId], (old = []) =>
        old.filter((singer) => singer.id !== id)
      );

      queryClient.removeQueries({ queryKey: ["singerDetails", id] });

      return { previousList, roleId };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["singerDetailsList", context.roleId], context.previousList);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["singerDetailsList", variables.roleId]);
    },
  });
};
