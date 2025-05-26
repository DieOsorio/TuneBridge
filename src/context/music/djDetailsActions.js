import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH ALL DJ DETAILS FOR A ROLE
export const useFetchDjsQuery = (roleId) => {
  return useQuery({
    queryKey: ["djDetailsList", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// FETCH SINGLE DJ BY ID
export const useFetchDjById = (id) => {
  return useQuery({
    queryKey: ["djDetails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// ADD NEW DJ
export const useAddDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ details }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticDj = {
        id: tempId,
        ...details,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["djDetails", tempId], optimisticDj);

      queryClient.setQueryData(["djDetailsList", details.role_id], (old = []) => [
        ...old,
        optimisticDj,
      ]);

      return { tempId, roleId: details.role_id };
    },

    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["djDetails", context.tempId] });
        queryClient.setQueryData(["djDetailsList", context.roleId], (old = []) =>
          old.filter((item) => item.id !== context.tempId)
        );
      }
    },

    onSuccess: (data, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["djDetails", context.tempId] });
        queryClient.setQueryData(["djDetailsList", context.roleId], (old = []) =>
          old.map((item) => (item.id === context.tempId ? data : item))
        );
      }
      queryClient.setQueryData(["djDetails", data.id], data);
    },

    onSettled: (data) => {
      if (data?.role_id) {
        queryClient.invalidateQueries(["djDetailsList", data.role_id]);
      }
    },
  });
};

// UPDATE DJ
export const useUpdateDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries(["djDetails", id]);
      const previous = queryClient.getQueryData(["djDetails", id]);

      queryClient.setQueryData(["djDetails", id], (old = {}) => ({
        ...old,
        ...details,
      }));

      return { previous, id };
    },

    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["djDetails", context.id], context.previous);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["djDetails", variables.id]);
      if (_data?.role_id) {
        queryClient.invalidateQueries(["djDetailsList", _data.role_id]);
      }
    },
  });
};

// DELETE DJ
export const useDeleteDjMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("dj_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    onMutate: async ({ id, roleId }) => {
      await queryClient.cancelQueries(["djDetailsList", roleId]);
      await queryClient.cancelQueries(["djDetails", id]);

      const previousList = queryClient.getQueryData(["djDetailsList", roleId]);

      queryClient.setQueryData(["djDetailsList", roleId], (old = []) =>
        old.filter((dj) => dj.id !== id)
      );

      queryClient.removeQueries({ queryKey: ["djDetails", id] });

      return { previousList, roleId };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["djDetailsList", context.roleId], context.previousList);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["djDetailsList", variables.roleId]);
    },
  });
};
