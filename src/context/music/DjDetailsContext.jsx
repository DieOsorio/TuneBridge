import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchDjQuery,
  useAddDjMutation,
  useUpdateDjMutation,
  useDeleteDjMutation,
} from "./djDetailsActions";

const DjDetailsContext = createContext();
DjDetailsContext.displayName = "DjDetailsContext";

export const DjDetailsProvider = ({ children }) => { 
  const { data: djDetails, isLoading: loading, error, refetch} = useFetchDjQuery();
  const addDj = useAddDjMutation().mutateAsync;
  const updateDj = useUpdateDjMutation().mutateAsync;
  const deleteDj = useDeleteDjMutation().mutateAsync;

  const value = {
    djDetails,
    loading,
    error,
    refetch,
    fetchDj: useFetchDjQuery,
    addDj,
    updateDj,
    deleteDj,      
  };


  return (
    <DjDetailsContext.Provider
      value={value}
    >
      {children}
    </DjDetailsContext.Provider>
  );
  
};

DjDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useDjDetails = () => {
    const context = useContext(DjDetailsContext);
    if (!context) {
      throw new Error("useDjDetail must be used within an DjDetailsProvider");
    }
    return context;
  };