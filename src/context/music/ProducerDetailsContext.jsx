import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchProducerQuery,
  useAddProducerMutation,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
} from "./ProducerDetailsActions";

const ProducerDetailsContext = createContext();
ProducerDetailsContext.displayName = "ProducerDetailsContext";

export const ProducerDetailsProvider = ({ children }) => {
  const {data: composerDetails, isLoading: loading, error, refetch} = useFetchProducerQuery();
  const addProducer = useAddProducerMutation().mutateAsync;
  const updateProducer = useUpdateProducerMutation().mutateAsync;
  const deleteProducer = useDeleteProducerMutation().mutateAsync;

  const value = {
      composerDetails,
      loading,
      error,
      refetch,
      fetchProducer: useFetchProducerQuery,
      addProducer,
      updateProducer,
      deleteProducer,
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
