import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// Fetch all instruments for a given roleId
export const useFetchInstrumentsQuery = (roleId) => {
  return useQuery({
    queryKey: ["instrumentDetailsList", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch a single instrument by id
export const useFetchInstrumentById = (id) => {
  return useQuery({
    queryKey: ["instrumentDetails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new instrument
export const useAddInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ details }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticInstrument = {
        id: tempId,
        ...details,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["instrumentDetails", tempId], optimisticInstrument);

      queryClient.setQueryData(["instrumentDetailsList", details.role_id], (old = []) => [
        ...old,
        optimisticInstrument,
      ]);

      return { tempId, roleId: details.role_id };
    },

    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["instrumentDetails", context.tempId] });
        queryClient.setQueryData(["instrumentDetailsList", context.roleId], (old = []) =>
          old.filter((item) => item.id !== context.tempId)
        );
      }
    },

    onSuccess: (data, _variables, context) => {
      const realId = data.id;
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["instrumentDetails", context.tempId] });
        queryClient.setQueryData(["instrumentDetailsList", context.roleId], (old = []) =>
          old.map((item) => (item.id === context.tempId ? data : item))
        );
      }
      queryClient.setQueryData(["instrumentDetails", realId], data);
    },

    onSettled: (data) => {
      if (data?.role_id) {
        queryClient.invalidateQueries(["instrumentDetailsList", data.role_id]);
      }
    },
  });
};

// Update instrument
export const useUpdateInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .update(details)
        .eq("id", id)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries(["instrumentDetails", id]);

      const previousDetails = queryClient.getQueryData(["instrumentDetails", id]);
      queryClient.setQueryData(["instrumentDetails", id], (old = {}) => ({ ...old, ...details }));

      return { previousDetails, id };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["instrumentDetails", context.id], context.previousDetails);
      }
    },

    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries(["instrumentDetails", variables.id]);
      if (_data?.role_id) {
        queryClient.invalidateQueries(["instrumentDetailsList", _data.role_id]);
      }
    },
  });
};

// Delete instrument
export const useDeleteInstrumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("instrument_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    onMutate: async ({ id, roleId }) => {
      await queryClient.cancelQueries(["instrumentDetails", id]);
      await queryClient.cancelQueries(["instrumentDetailsList", roleId]);

      const previousList = queryClient.getQueryData(["instrumentDetailsList", roleId]);

      queryClient.setQueryData(["instrumentDetailsList", roleId], (old = []) =>
        old.filter((instrument) => instrument.id !== id)
      );

      queryClient.removeQueries({ queryKey: ["instrumentDetails", id] });

      return { previousList, roleId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["instrumentDetailsList", context.roleId], context.previousList);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["instrumentDetailsList", variables.roleId]);
    },
  });
};
