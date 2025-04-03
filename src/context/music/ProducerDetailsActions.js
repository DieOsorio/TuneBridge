import { withLoading, handleError } from "../../utils/helpers";

export const fetchProducerDetails = async (supabase, roleId, setProducerDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw error;

      setProducerDetails(data);
      return data;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const addProducerDetails = async (supabase, details, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
      .schema("music")
      .from("producer_details")
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

export const updateProducerDetails = async (supabase, id, updatedDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("producer_details")
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

export const deleteProducerDetails = async (supabase, id, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
      .schema("music")
      .from("producer_details")
      .delete()
      .eq("id", id);

      if (error) throw error;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};