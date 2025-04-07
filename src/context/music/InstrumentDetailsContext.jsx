import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  fetchInstrumentsQuery,
  addInstrumentMutation,
  updateInstrumentMutation,
  deleteInstrumentMutation,
} from "./instrumentDetailsActions";

const InstrumentDetailsContext = createContext(null);
InstrumentDetailsContext.displayName = "InstrumentDetailsContext";

export const InstrumentDetailsProvider = ({ children }) => {
  
  const {data, isLoading, error, refetch}= fetchInstrumentsQuery();
  const addInstrument = addInstrumentMutation();
  const updateInstrument = updateInstrumentMutation();
  const deleteInstrument = deleteInstrumentMutation();  

  const value ={
      instruments: data,
      loading: isLoading,
      error,
      refetch,
      addInstrument: addInstrument.mutateAsync,
      updateInstrument: updateInstrument.mutateAsync,
      deleteInstrument: deleteInstrument.mutateAsync,
    }

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