import { withLoading, handleError } from "../../utils/helpers";

export const fetchUserConnections = async (supabase, profileId, setConnections, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .select("*")
        .or(`follower_profile_id.eq.${profileId},following_profile_id.eq.${profileId}`);
      if (error) throw error;

      setConnections(data);
      return data;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const addUserConnection = async (supabase, connection, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
      .schema("social")
      .from("user_connections")
      .insert(connection)
      .select();
      if (error) throw error;

      return data[0];
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const updateUserConnection = async (supabase, id, updatedConnection, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("social")
        .from("user_connections")
        .update(updatedConnection)
        .eq("id", id)
        .select();
      if (error) throw error;

      return data[0];
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const deleteUserConnection = async (supabase, id, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
      .schema("social")
      .from("user_connections")
      .delete()
      .eq("id", id);
      if (error) throw error;
      
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};