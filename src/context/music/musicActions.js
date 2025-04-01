import { supabase } from "../../supabase";

// Fetch all roles for a specific profile
export const fetchRoles = async (profileId) => {
  try {
    const { data, error } = await supabase
      .schema("music")  
      .from("roles")
      .select("*")
      .eq("profile_id", profileId);

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Error fetching roles:", err.message);
    throw err;
  }
};

// Add a new role for a profile
export const addRole = async (profileId, roleName) => {
  try {
    const { data, error } = await supabase
      .schema("music") 
      .from("roles") 
      .insert([{ profile_id: profileId, role: roleName }]) // Use the correct column name "role"
      .select("*"); 

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("Error adding role:", err.message);
    throw err;
  }
};

// Update role-specific details (e.g., instruments, genres)
export const updateRoleDetails = async (roleId, details, tableName) => {
  try {
    const { data, error } = await supabase
      .schema("music")  
      .from(tableName)
      .update(details)
      .eq("role_id", roleId);

    if (error) throw error;

    return data;
  } catch (err) {
    console.error(`Error updating details in ${tableName}:`, err.message);
    throw err;
  }
};

// Delete a role and its associated details
export const deleteRole = async (roleId) => {
  try {
    const { error } = await supabase
      .schema("music")    
      .from("roles")
      .delete()
      .eq("id", roleId);

    if (error) throw error;

    return true;
  } catch (err) {
    console.error("Error deleting role:", err.message);
    throw err;
  }
};