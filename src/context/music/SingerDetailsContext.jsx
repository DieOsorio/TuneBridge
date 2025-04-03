import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchSingerDetails,
  addSingerDetails,
  updateSingerDetails,
  deleteSingerDetails,
} from "./SingerDetailsActions";

const SingerDetailsContext = createContext();
SingerDetailsContext.displayName = "SingerDetailsContext";

export const SingerDetailsProvider = ({ children }) => {
  const [singerDetails, setSingerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const value = useMemo(
      () => ({
        singerDetails,
        loading,
        error,
        fetchDetails: async (roleId) => {
          return await fetchSingerDetails(supabase, roleId, setSingerDetails, setError, setLoading);
        },
        addDetails: async (details) => {
          return await addSingerDetails(supabase, details, setError, setLoading);
        },
        updateDetails: async (id, updatedDetails) => {
          return await updateSingerDetails(supabase, id, updatedDetails, setError, setLoading);
        },
        deleteDetails: async (id) => {
          return await deleteSingerDetails(supabase, id, setError, setLoading);
        },
      }),
      [singerDetails, loading, error]
    );

  return (
    <SingerDetailsContext.Provider
      value={value}
    >
      {children}
    </SingerDetailsContext.Provider>
  );
};

SingerDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSingerDetails = () => {
  const context = useContext(SingerDetailsContext);
  if (!context) {
    throw new Error("useSinger must be used within an SingerDetailsProvider");
  }
  return context;
};