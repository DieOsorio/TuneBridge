import { withLoading, handleError } from "../../utils/helpers"

// Fetch all instruments for a profile
export const fetchInstruments = async (supabase, profileId, setInstruments, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .select("*")
        .eq("profile_id", profileId);
      if (error) throw error;      
      
      setInstruments(data);
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

// Add a new instrument for a profile
export const addInstrument = async (supabase, profileId, instrumentData, setInstruments, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .insert([{ profile_id: profileId, ...instrumentData }])
        .select();
      if (error) throw error;
      setInstruments((prevInstruments) => [...prevInstruments, data[0]]);
      return data[0];
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

// Update an existing instrument
export const updateInstrument = async (supabase, instrumentId, updatedData, setInstruments, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { data, error } = await supabase
        .schema("music")
        .from("instrument_details")
        .update(updatedData)
        .eq("id", instrumentId)
        .select();
      if (error) throw error;
      setInstruments((prevInstruments) =>
        prevInstruments.map((instrument) =>
          instrument.id === instrumentId ? data[0] : instrument
        )
      );
      return data[0];
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};

// Delete an instrument
export const deleteInstrument = async (supabase, instrumentId, setInstruments, setError, setLoading) => {
  return await withLoading(async () => {
    setError("");
    try {
      const { error } = await supabase
        .schema("music")
        .from("instrument_details")
        .delete()
        .eq("id", instrumentId);
      if (error) throw error;
      setInstruments((prevInstruments) =>
        prevInstruments.filter((instrument) => instrument.id !== instrumentId)
      );
    } catch (err) {
      handleError(err, setError);
      throw err;
    }
  }, setLoading);
};