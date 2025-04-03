import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchInstruments,
  addInstrument,
  updateInstrument,
  deleteInstrument,
} from "./instrumentDetailsActions";

const InstrumentDetailsContext = createContext(null);
InstrumentDetailsContext.displayName = "InstrumentDetailsContext";

export const InstrumentDetailsProvider = ({ children }) => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = useMemo(
    () => ({
      instruments,
      loading,
      error,
      fetchInstruments: async (profileId) => {
        return await fetchInstruments(supabase, profileId, setInstruments, setError, setLoading);
      },
      addInstrument: async (profileId, instrumentData) => {
        return await addInstrument(supabase, profileId, instrumentData, setInstruments, setError, setLoading);
      },
      updateInstrument: async (instrumentId, updatedData) => {
        return await updateInstrument(supabase, instrumentId, updatedData, setInstruments, setError, setLoading);
      },
      deleteInstrument: async (instrumentId) => {
        return await deleteInstrument(supabase, instrumentId, setInstruments, setError, setLoading);
      },
    }),
    [instruments, loading, error]
  );

  return <InstrumentDetailsContext.Provider value={value}>{children}</InstrumentDetailsContext.Provider>;
};

InstrumentDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useInstruments = () => {
  const context = useContext(InstrumentDetailsContext);
  if (!context) {
    throw new Error("useInstruments must be used within an InstrumentsProvider");
  }
  return context;
};