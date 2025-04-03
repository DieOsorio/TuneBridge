import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchDjDetails,
  addDjDetails,
  updateDjDetails,
  deleteDjDetails,
} from "./djDetailsActions";

const DjDetailsContext = createContext();
DjDetailsContext.displayName = "DjDetailsContext";

export const DjDetailsProvider = ({ children }) => {
  const [djDetails, setDjDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");    

  const value = useMemo(
    () => ({
        djDetails,
        loading,
        error,
        fetchDetails: async (roleId) => {
            return await fetchDjDetails(supabase, roleId, setDjDetails, setError, setLoading);
          },
        addDetails: async (details) => {
            return await addDjDetails(supabase, details, setError, setLoading);
          },
        updateDetails: async (id, updatedDetails) => {
            return await updateDjDetails(supabase, id, updatedDetails, setError, setLoading);
          },
        deleteDetails: async (id) => {
            return await deleteDjDetails(supabase, id, setError, setLoading);
          },
      }),
    [djDetails, loading, error]
  );


  return (
    <DjDetailsContext.Provider
      value={value}
    >
      {children}
    </DjDetailsContext.Provider>
  );
  
};

DjDetailsProvider.PropTypes = {
  children: PropTypes.node.isRequired,
};

export const useDjDetails = () => {
    const context = useContext(DjDetailsContext);
    if (!context) {
      throw new Error("useDjDetail must be used within an DjDetailsProvider");
    }
    return context;
  };