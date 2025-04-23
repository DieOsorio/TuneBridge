import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { supabase } from '../../supabase';

// Fetch all roles for a profile
export const useFetchRolesQuery = (profileId) => {
  return useQuery({
    queryKey: ["roles", profileId],
    queryFn: async () => {
      if (!profileId) {
        console.error("profileId is not avialable");
        return [];                
      }

      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .select("*")
        .eq("profile_id", profileId);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!profileId,
  });
}

// Add a role to a profile
export const useAddRoleMutation = () => {
    const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profileId, roleName }) => {
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .insert({ profile_id: profileId, role: roleName })
        .select();
               
      if (error) throw new Error(error.message);
      return data[0];
    },

    //optimistic update
    onMutate: async ({profileId, roleName}) => {
        await queryClient.cancelQueries({queryKey: ["roles", profileId]});

        const previousRoles = queryClient.getQueryData(["roles", profileId]);

        const optimisticRole = {
            id: `temp-${Date.now()}`,
            profile_id: profileId,
            role: roleName,
            created_at: new Date().toISOString(),
        };

        queryClient.setQueryData(["roles", profileId], (old = []) => [...old,optimisticRole]);

        return { previousRoles };
    },

    onError: (err, _variables, context) => {
        if (context?.previousRoles) {
            queryClient.setQueryData(["roles", _variables.profileId]);
        }
    },

    onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({ queryKey: ["roles", variables.profileId]});
    },
  });
}

// Delete a role from a profile
export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId) => {
      const { error } = await supabase
        .schema("music")
        .from("roles")
        .delete()
        .eq("id", roleId);
      if (error) throw new Error(error.message);
    },

    // Optimistic update
    onMutate: async (roleId) => {
     await queryClient.cancelQueries({ queryKey: ["roles"]});
     
        const previousRoles = queryClient.getQueryData(["roles"]);

        queryClient.setQueryData(["roles"], (old) =>
        old ? old.filter((role) => role.id !== roleId) : []
        );

        return { previousRoles };
    },

    onError: (err, roleId, context) => {
        if (context?.previousRoles) {
            queryClient.setQueryData(["roles"], context.previousRoles);
        }
    },

    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["roles"]});
    },
  });
}


// Delete a role from a profile
// export const deleteRole = async (supabase, roleId, setRoles, setError, setLoading) => {
//   await withLoading(async () => {
//     setError("");
//     try {
//       const { error } = await supabase
//         .schema("music")
//         .from("roles")
//         .delete()
//         .eq("id", roleId);
//       if (error) throw error;

//       // Update the roles state by removing the deleted role
//       setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
//     } catch (err) {
//       handleError(err, setError);
//     }
//   }, setLoading);
// };