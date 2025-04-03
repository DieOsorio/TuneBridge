import { withLoading, handleError } from "../../utils/helpers"

export const fetchSingerDetails = async (supabase, roleId, setSingerDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw error;
      setSingerDetails(data);
      return data;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const addSingerDetails = async (supabase, details, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    console.log("Singer details:", details);
    
    try {
      const { data, error } = await supabase
      .schema("music")
      .from("singer_details")
      .insert(details)
      .select();
      if (error) throw error;
      console.log("Inserted data:", data);
      
      return data[0];      
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const updateSingerDetails = async (supabase, id, updatedDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("singer_details")
        .update(updatedDetails)
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

export const deleteSingerDetails = async (supabase, id, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
      .schema("music")
      .from("singer_details")
      .delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};