import { withLoading, handleError } from "../../utils/helpers";

export const fetchDjDetails = async (supabase, roleId, setDjDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw error;
      
      setDjDetails(data);
      return data;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const addDjDetails = async (supabase, details, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
      .schema("music")
      .from("dj_details")
      .insert(details)
      .select();

      if (error) throw error;
      return data[0];
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const updateDjDetails = async (supabase, id, updatedDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("dj_details")
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

export const deleteDjDetails = async (supabase, id, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
      .schema("music")
      .from("dj_details")
      .delete()
      .eq("id", id);

      if (error) throw error;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};