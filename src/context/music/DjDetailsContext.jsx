import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  fetchDjQuery,
  addDjMutation,
  updateDjMutation,
  deleteDjMutation,
} from "./djDetailsActions";

const DjDetailsContext = createContext();
DjDetailsContext.displayName = "DjDetailsContext";

export const DjDetailsProvider = ({ children }) => { 
  const { data, isLoading, error, refetch} = fetchDjQuery();
  const addDj = addDjMutation()
  const updateDj = updateDjMutation();
  const deleteDj = deleteDjMutation();

  const value = {
    djDetails: data,
    loading: isLoading,
    error,
    refetch,
    addDj: addDj.mutateAsync,
    updateDj: updateDj.mutateAsync,
    deleteDj: deleteDj.mutateAsync,      
  };


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