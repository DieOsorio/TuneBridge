import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchComposerDetails,
  addComposerDetails,
  updateComposerDetails,
  deleteComposerDetails,
} from "./ComposerDetailsActions";

const ComposerDetailsContext = createContext();
ComposerDetailsContext.displayName = "ComposerDetailsContext";

export const ComposerDetailsProvider = ({ children }) => {
  const [composerDetails, setComposerDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const value = useMemo(
    () => ({
      composerDetails,
      loading,
      error,
      fetchDetails: async (roleId) => {
        return await fetchComposerDetails(supabase, roleId, setComposerDetails, setError, setLoading);
      },
      addDetails: async (details) => {
        return await addComposerDetails(supabase, details, setError, setLoading);
      },
      updateDetails: async (id, updatedDetails) => {
        return await updateComposerDetails(supabase, id, updatedDetails, setError, setLoading);
      },
      deleteDetails: async (id) => {
        return await deleteComposerDetails(supabase, id, setError, setLoading);
      },
    }),
    [composerDetails, loading, error]
  );

  return (
    <ComposerDetailsContext.Provider
      value={value}
    >
      {children}
    </ComposerDetailsContext.Provider>
  );
};

ComposerDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useComposerDetails = () => {
  const context = useContext(ComposerDetailsContext);
  if (!context) {
    throw new Error("useComposerDetails must be used within a ComposerDetailsProvider");
  }
  return context;
};