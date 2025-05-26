import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from '../../supabase';
import { useMemo } from "react";

// INFINITE SCROLL FOR ALL PROFILES
const PAGE_SIZE = 8; // Number of profiles to fetch per page

export const useInfiniteProfilesQuery = () => {
    return useInfiniteQuery({
      queryKey: ["profilesInfinite"],
      queryFn: async ({ pageParam = 0 }) => {
        const from = pageParam * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
  
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to);
  
        if (error) throw new Error(error.message);
        return data;
      },
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length < PAGE_SIZE) return undefined; // No more pages to load
        return allPages.length; // Next page number
      },
    });
  };

// Fetch profiles based on search term
  export const useSearchProfilesQuery = (searchTerm) => {
    return useQuery({
      queryKey: ["searchProfiles", searchTerm],
      queryFn: async () => {
        if (!searchTerm) return []; 
  
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .textSearch("content_search_all", searchTerm, {
            type: "websearch",
          });

        if (error) throw new Error(error.message);
        return data;
      },
      enabled: !!searchTerm, // Only run the query if searchTerm is defined
    });
  };

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
