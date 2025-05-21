import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// Fetch all producer details for a given roleId
export const useFetchProducersQuery = (roleId) => {
  return useQuery({
    queryKey: ["producerDetailsList", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!roleId,
  });
};

// Fetch a single producer detail by id
export const useFetchProducerById = (id) => {
  return useQuery({
    queryKey: ["producerDetails", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });
};

// Add new producer
export const useAddProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .insert(details)
        .select();
      if (error) throw new Error(error.message);
      return data[0];
    },

    onMutate: async ({ details }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticProducer = {
        id: tempId,
        ...details,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["producerDetails", tempId], optimisticProducer);

      queryClient.setQueryData(["producerDetailsList", details.role_id], (old = []) => [
        ...old,
        optimisticProducer,
      ]);

      return { tempId, roleId: details.role_id };
    },

    onError: (_err, _variables, context) => {
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["producerDetails", context.tempId] });
        queryClient.setQueryData(["producerDetailsList", context.roleId], (old = []) =>
          old.filter((item) => item.id !== context.tempId)
        );
      }
    },

    onSuccess: (data, _variables, context) => {
      const realId = data.id;
      if (context?.tempId) {
        queryClient.removeQueries({ queryKey: ["producerDetails", context.tempId] });
        queryClient.setQueryData(["producerDetailsList", context.roleId], (old = []) =>
          old.map((item) => (item.id === context.tempId ? data : item))
        );
      }
      queryClient.setQueryData(["producerDetails", realId], data);
    },

    onSettled: (data) => {
      if (data?.role_id) {
        queryClient.invalidateQueries(["producerDetailsList", data.role_id]);
      }
    },
  });
};

// Update producer
export const useUpdateProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .update(details)
        .eq("id", id)
        .select();
        
      if (error) throw new Error(error.message);    
      return data[0];
    },

    onMutate: async ({ id, details }) => {
      await queryClient.cancelQueries(["producerDetails", id]);

      const previousDetails = queryClient.getQueryData(["producerDetails", id]);
      queryClient.setQueryData(["producerDetails", id], (old = {}) => ({ ...old, ...details }));

      return { previousDetails, id };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["producerDetails", context.id], context.previousDetails);
      }
    },

    onSettled: (_data, _err, variables) => {
      if (variables?.id) {
        queryClient.invalidateQueries(["producerDetails", variables.id]);
      }
      if (_data?.role_id) {
        queryClient.invalidateQueries(["producerDetailsList", _data.role_id]);
      }
    },
  });
};

// Delete producer
export const useDeleteProducerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .schema("music")
        .from("producer_details")
        .delete()
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    onMutate: async ({ id, roleId }) => {
      await queryClient.cancelQueries(["producerDetails", id]);
      await queryClient.cancelQueries(["producerDetailsList", roleId]);

      const previousList = queryClient.getQueryData(["producerDetailsList", roleId]);

      queryClient.setQueryData(["producerDetailsList", roleId], (old = []) =>
        old.filter((producer) => producer.id !== id)
      );

      queryClient.removeQueries({ queryKey: ["producerDetails", id] });

      return { previousList, roleId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["producerDetailsList", context.roleId], context.previousList);
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries(["producerDetailsList", variables.roleId]);
    },
  });
};
