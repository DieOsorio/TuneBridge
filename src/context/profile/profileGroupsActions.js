import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../supabase";

// FETCH ALL PROFILE GROUPS
export const useFetchProfileGroupsQuery = () => {
  return useQuery({
    queryKey: ["profileGroups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .order("created_at", { ascending: false }); // Order by creation date (most recent first)

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

// FETCH A SPECIFIC PROFILE GROUP
export const useFetchProfileGroupQuery = (id) => {
  return useQuery({
    queryKey: ["profileGroups", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("*")
        .eq("id", id)
        .single(); // Fetch a single group by ID

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id, // Only run the query if an ID is provided
  });
};

// CREATE NEW PROFILE GROUP
export const useCreateProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (group) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .insert(group)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async (group) => {
      await queryClient.cancelQueries({ queryKey: ["profileGroups"] });

      const previousGroups = queryClient.getQueryData(["profileGroups"]);

      const optimisticGroup = {
        id: `temp-${Date.now()}`,
        ...group,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(["profileGroups"], (old = []) => [
        optimisticGroup,
        ...old,
      ]);

      return { previousGroups };
    },

    onError: (err, _variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(["profileGroups"], context.previousGroups);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profileGroups"] });
    },
  });
};

// UPDATE PROFILE GROUP
export const useUpdateProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedGroup }) => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .update(updatedGroup)
        .eq("id", id)
        .select();

      if (error) throw new Error(error.message);
      return data[0];
    },

    // Optimistic update
    onMutate: async ({ id, updatedGroup }) => {
      await queryClient.cancelQueries({ queryKey: ["profileGroups"] });

      const previousGroups = queryClient.getQueryData(["profileGroups"]);

      queryClient.setQueryData(["profileGroups"], (old = []) =>
        old.map((group) =>
          group.id === id ? { ...group, ...updatedGroup } : group
        )
      );

      // Update the specific group query data
      queryClient.setQueryData(["profileGroups", id], (old) => ({
        ...old,
        ...updatedGroup,
      }));

      return { previousGroups };
    },

    onError: (err, _variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(["profileGroups"], context.previousGroups);
      }
    },

    onSettled: (data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["profileGroups"] });
      queryClient.invalidateQueries({ queryKey: ["profileGroups", id] });
    },
  });
};

// DELETE PROFILE GROUP
export const useDeleteProfileGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .schema("users")
        .from("profile_groups")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },

    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["profileGroups"] });

      const previousGroups = queryClient.getQueryData(["profileGroups"]);

      queryClient.setQueryData(["profileGroups"], (old = []) =>
        old.filter((group) => group.id !== id)
      );

      // Remove the specific group query data
      queryClient.removeQueries({ queryKey: ["profileGroups", id] });

      return { previousGroups };
    },

    onError: (err, _variables, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(["profileGroups"], context.previousGroups);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profileGroups"] });
    },
  });
};