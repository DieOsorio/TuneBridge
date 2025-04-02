import { supabase } from "../../supabase";

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

// Fetch all roles for a profile
export const fetchRoles = async (supabase, profileId, setRoles, setError, setLoading) => {
  await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .select("*")
        .eq("profile_id", profileId);
      if (error) throw error;
      setRoles(data);
    } catch (err) {
      handleError(err, setError);
    }
  }, setLoading);
};

// Add a role to a profile
export const addRole = async (supabase, profileId, roleName, setRoles, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("roles")
        .insert({ profile_id: profileId, role: roleName })
        .select();
      if (error) throw error;

      // Update the roles state with the new role
      setRoles((prevRoles) => [...prevRoles, data[0]]);
      return data[0]; // Return the newly added role
    } catch (err) {
      handleError(err, setError);
      throw err; // Re-throw the error to propagate it if needed
    }
  }, setLoading);
};

// Delete a role from a profile
export const deleteRole = async (supabase, roleId, setRoles, setError, setLoading) => {
  await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
        .schema("music")
        .from("roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;

      // Update the roles state by removing the deleted role
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    } catch (err) {
      handleError(err, setError);
    }
  }, setLoading);
};