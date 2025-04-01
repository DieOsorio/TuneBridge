// Handles errors and logs them to the console
export const handleError = (err, setError) => {
    console.error(err.message || "An unknown error occurred");
    setError(err.message || "An unknown error occurred");
};

// Function to handle loading state
export const withLoading = async (callback, setLoading) => {
    setLoading(true);
    try {
        const result = await callback(); // Capture the result of the callback
        return result; // Return the result to propagate it
    } finally {
        setLoading(false);
    }
};

// Fetch all profiles
export const fetchAllProfiles = async (supabase, setAllProfiles, setError, setLoading) => {
    await withLoading(async () => {
        setError("");
        try {
            const { data, error } = await supabase
                .schema("users")
                .from("profiles")
                .select("*");
            if (!data) {
                throw new Error("No profiles found");
            }
            setAllProfiles(data);
        } catch (err) {
            handleError(err, setError);
        }
    }, setLoading);
};

// Fetch a single profile
export const fetchProfile = async (supabase, user, identifier, setProfile, setError, setLoading) => {
    return await withLoading(async () => {
        setError("");
        try {
            if (!user) {
                setProfile(null);
                return null;
            }

            let query = supabase
                .schema("users")
                .from("profiles")
                .select("*");

            // Determine whether to query by id (UUID) or username
            if (identifier) {
                const isUUID = identifier.includes("-") && identifier.length === 36; // Simple UUID check
                if (isUUID) {
                    query = query.eq("id", identifier); // Fetch by userId (UUID)
                } else {
                    query = query.eq("username", identifier); // Fetch by username
                }
            } else {
                query = query.eq("id", user.id); // Fetch the logged-in user's profile
            }

            const { data: profileData, error } = await query.single();

            if (error) {
                throw new Error(error.message);
            }

            // Update state only if fetching the logged-in user's profile
            if (!identifier || identifier === user.id) {
                setProfile(profileData);
            }

            return profileData; // Ensure the profile data is returned
        } catch (err) {
            handleError(err, setError);
            return null;
        }
    }, setLoading);
};

// Create a profile
export const createProfile = async (supabase, userId, email, setError, setLoading) => {
    await withLoading(async () => {
        setError("");
        try {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .insert([
                    {
                        id: userId,
                        username: null,
                        email: email,
                        avatar_url: "",
                        country: "",
                        city: "",
                        firstname: "",
                        lastname: "",
                        gender: "",
                        birthdate: null
                    },
                ]);
            if (error) {
                throw new Error(error.message);
            }
        } catch (err) {
            handleError(err, setError);
        }
    }, setLoading);
};

// Update a profile
export const updateProfile = async (supabase, profileData, setProfile, setError, setLoading) => {
    await withLoading(async () => {
        setError("");
        try {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .update({
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

            if (error) {
                throw new Error(error.message);
            }

            setProfile((prev) => ({ ...prev, ...profileData }));
        } catch (err) {
            handleError(err, setError);
        }
    }, setLoading);
};

// Delete a profile
export const deleteProfile = async (supabase, userId, setProfile, setError, setLoading) => {
    await withLoading(async () => {
        setError("");
        try {
            const { error } = await supabase
                .schema("users")
                .from("profiles")
                .delete()
                .eq("id", userId);

            if (error) {
                throw new Error(error.message);
            }

            setProfile(null);
        } catch (err) {
            handleError(err, setError);
        }
    }, setLoading);
};