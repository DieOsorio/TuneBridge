import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { useMemo } from "react";

// Fetch all profiles
export const useAllProfilesQuery = () => {
    return useQuery({
        queryKey: ['allProfiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .schema("users")
                .from("profiles")
                .select("*");

            if (error) throw new Error(error.message);
            return data;
        }
    });
};

// Fetch a single profile
export const useProfileQuery = (identifier) => {
    return useQuery({
      queryKey: ['profile', identifier],
      queryFn: async () => {
        if (!identifier) return null;
  
        const isUUID = identifier.includes("-") && identifier.length === 36;
  
        const query = supabase
          .schema("users")
          .from("profiles")
          .select("*")
          .eq(isUUID ? "id" : "username", identifier);
  
        const { data, error } = await query.single();
        if (error) throw new Error(error.message);
        return data;
      },
      enabled: !!identifier,
    });
  };


  //Map through an array of profile IDs an acces each one
  export const useProfilesMap = (profileIds = []) => {
    const uniqueSortedIds = useMemo(() => [...new Set(profileIds)].sort(), [profileIds])

    return useQuery({
      queryKey: ['profilesMap', uniqueSortedIds],
      enabled: uniqueSortedIds.length > 0, 
      queryFn: async () => {
        if (!profileIds || profileIds.length === 0) return;
  
        const { data, error } = await supabase
          .schema("users")
          .from("profiles")
          .select('id, avatar_url, username')
          .in('id', uniqueSortedIds);
         
        if (error) throw new Error(error.message);
        
        const map = {};
        data.forEach(profile => {
            map[profile.id] = profile;
        });

        return map;
      }
    });
  };


// Prefetch a single profile
export const usePrefetchProfile = () => {
    const queryClient = useQueryClient();

    return async (identifier) => {
        if (!identifier) return;
    
        await queryClient.prefetchQuery({
        queryKey: ['profile', identifier],
        queryFn: async () => {    
            const isUUID = identifier.includes("-") && identifier.length === 36;
    
            const query = supabase
            .schema("users")
            .from("profiles")
            .select("*")
            .eq(isUUID ? "id" : "username", identifier);
    
            const { data, error } = await query.single();
            if (error) throw new Error(error.message);
            return data;
      },
    });
  };
};

// Create a profile
export const useCreateProfile = () => {
    return useMutation({
        mutationFn: async ({ userId, email }) => {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .insert([{
                    id: userId,
                    username: null,
                    email,
                    avatar_url: "",
                    country: "",
                    city: "",
                    firstname: "",
                    lastname: "",
                    gender: "",
                    birthdate: null,
                }]);

            if (error) throw new Error(error.message);
        }
    });
};

// Update a profile
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (profileData) => {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .update({
                    bio: profileData.bio,
                    username: profileData.username,
                    gender: profileData.gender,
                    avatar_url: profileData.avatar_url,
                    country: profileData.country,
                    city: profileData.city,
                    firstname: profileData.firstname,
                    lastname: profileData.lastname,
                    birthdate: profileData.birthdate
                })
                .eq("id", profileData.id);

            if (error) throw new Error(error.message);
            return profileData;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
            queryClient.invalidateQueries({ queryKey: ['Allprofile'] });
        }
    });
};

// Delete a profile
export const useDeleteProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId) => {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .delete()
                .eq("id", userId);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
        }
    });
};
