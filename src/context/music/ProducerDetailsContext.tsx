import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchProducersQuery,
  useFetchProducerById,
  useAddProducerMutation,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
  ProducerDetail
} from "./ProducerDetailsActions";

interface ProducerDetailsContextValue {
  producerDetails?: ProducerDetail[];
  loading: boolean;
  error: unknown;
  fetchProducers: typeof useFetchProducersQuery;
  fetchProducerById: typeof useFetchProducerById;
  addProducer: ReturnType<typeof useAddProducerMutation>["mutateAsync"];
  updateProducer: ReturnType<typeof useUpdateProducerMutation>["mutateAsync"];
  deleteProducer: ReturnType<typeof useDeleteProducerMutation>["mutateAsync"];
}

const ProducerDetailsContext = createContext<ProducerDetailsContextValue | undefined>(undefined);
ProducerDetailsContext.displayName = "ProducerDetailsContext";

export const ProducerDetailsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // NOTE: You must pass a roleId to useFetchProducersQuery, so this context should be refactored to accept it as a prop or from a parent context
  // For now, we'll use an empty string as a placeholder
  const { data: producerDetails, isLoading: loading, error } = useFetchProducersQuery("");
  const addProducer = useAddProducerMutation().mutateAsync;
  const updateProducer = useUpdateProducerMutation().mutateAsync;
  const deleteProducer = useDeleteProducerMutation().mutateAsync;

  const value: ProducerDetailsContextValue = {
    producerDetails,
    loading,
    error,
    fetchProducers: useFetchProducersQuery,
    fetchProducerById: useFetchProducerById,
    addProducer,
    updateProducer,
    deleteProducer,
  };

  return <ProducerDetailsContext.Provider value={value}>{children}</ProducerDetailsContext.Provider>;
};

export const useProducerDetails = (): ProducerDetailsContextValue => {
  const context = useContext(ProducerDetailsContext);
  if (!context) {
    throw new Error("useProducerDetails must be used within a ProducerDetailsProvider");
  }
  return context;
};
