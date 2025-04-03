import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchProducerDetails,
  addProducerDetails,
  updateProducerDetails,
  deleteProducerDetails,
} from "./ProducerDetailsActions";

const ProducerDetailsContext = createContext();
ProducerDetailsContext.displayName = "ProducerDetailsContext";

export const ProducerDetailsProvider = ({ children }) => {
  const [producerDetails, setProducerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const value = useMemo(
    () => ({
      producerDetails,
      loading,
      error,
      fetchDetails: async (roleId) => {
        return await fetchProducerDetails(supabase, roleId, setProducerDetails, setError, setLoading);
      },
      addDetails: async (details) => {
        return await addProducerDetails(supabase, details, setError, setLoading);
      },    
      updateDetails: async (id, updatedDetails) => {
        return await updateProducerDetails(supabase, id, updatedDetails, setError, setLoading);
      },
      deleteDetails: async (id) => {
        return await deleteProducerDetails(supabase, id, setError, setLoading);
      },
    }),
    [producerDetails, loading, error]
  );

  return (
    <ProducerDetailsContext.Provider
      value={value}
    >
      {children}
    </ProducerDetailsContext.Provider>
  );
};

ProducerDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProducerDetails = () => {
  const context = useContext(ProducerDetailsContext);
  if (!context) {
    throw new Error("useProducerDetails must be used within a ProducerDetailsProvider");
  }
  return context;
};
