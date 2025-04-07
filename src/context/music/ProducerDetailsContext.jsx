import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  fetchProducerQuery,
  addProducerMutation,
  updateProducerMutation,
  deleteProducerMutation,
} from "./ProducerDetailsActions";

const ProducerDetailsContext = createContext();
ProducerDetailsContext.displayName = "ProducerDetailsContext";

export const ProducerDetailsProvider = ({ children }) => {
  const {data, isLoading, error, refetch} = fetchProducerQuery();
  const addProducer = addProducerMutation();
  const updateProducer = updateProducerMutation();
  const deleteProducer = deleteProducerMutation();

  const value = {
      composerDetails: data,
      loading: isLoading,
      error,
      refetch,
      addProducer: addProducer.mutateAsync,
      updateProducer: updateProducer.mutateAsync,
      deleteProducer: deleteProducer.mutateAsync,
    };

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
