import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchInstrumentsQuery,
  useFetchInstrumentById,
  useAddInstrumentMutation,
  useUpdateInstrumentMutation,
  useDeleteInstrumentMutation,
} from "./instrumentDetailsActions";

const InstrumentDetailsContext = createContext(null);
InstrumentDetailsContext.displayName = "InstrumentDetailsContext";

export const InstrumentDetailsProvider = ({ children }) => {
  
  const {data: instruments, isLoading: loading, error, refetch}= useFetchInstrumentsQuery();
  const addInstrument = useAddInstrumentMutation().mutateAsync;
  const updateInstrument = useUpdateInstrumentMutation().mutateAsync;
  const deleteInstrument = useDeleteInstrumentMutation().mutateAsync;  

  const value ={
      instruments,
      loading,
      error,
      refetch,
      fetchInstruments: useFetchInstrumentsQuery,
      fetchInstrumentById: useFetchInstrumentById,
      addInstrument,
      updateInstrument,
      deleteInstrument,
    }

  return <InstrumentDetailsContext.Provider value={value}>{children}</InstrumentDetailsContext.Provider>;
};

InstrumentDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useInstrumentsDetails = () => {
  const context = useContext(InstrumentDetailsContext);
  if (!context) {
    throw new Error("useInstruments must be used within an InstrumentsProvider");
  }
  return context;
};