import { withLoading, handleError } from "../../utils/helpers";

export const fetchComposerDetails = async (supabase, roleId, setComposerDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
        .select("*")
        .eq("role_id", roleId);
      if (error) throw error;

      setComposerDetails(data);
      return data;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

export const addComposerDetails = async (supabase, details, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
      .schema("music")
      .from("composer_details")
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

export const updateComposerDetails = async (supabase, id, updatedDetails, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("composer_details")
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

export const deleteComposerDetails = async (supabase, id, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
      .schema("music")
      .from("composer_details")
      .delete()
      .eq("id", id);
      if (error) throw error;
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};