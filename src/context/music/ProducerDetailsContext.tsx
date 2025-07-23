import { createContext, useContext, ReactNode } from "react";
import {
  useFetchProducersQuery,
  useFetchProducerById,
  useAddProducerMutation,
  useUpdateProducerMutation,
  useDeleteProducerMutation,
} from "./ProducerDetailsActions";

interface ProducerDetailsContextValue {
  fetchProducers: typeof useFetchProducersQuery;
  fetchProducerById: typeof useFetchProducerById;
  addProducer: ReturnType<typeof useAddProducerMutation>["mutateAsync"];
  updateProducer: ReturnType<typeof useUpdateProducerMutation>["mutateAsync"];
  deleteProducer: ReturnType<typeof useDeleteProducerMutation>["mutateAsync"];
}

const ProducerDetailsContext = createContext<ProducerDetailsContextValue | undefined>(undefined);
ProducerDetailsContext.displayName = "ProducerDetailsContext";

export const ProducerDetailsProvider = ({ children }: { children: ReactNode }) => {
  const addProducer = useAddProducerMutation().mutateAsync;
  const updateProducer = useUpdateProducerMutation().mutateAsync;
  const deleteProducer = useDeleteProducerMutation().mutateAsync;

  const value: ProducerDetailsContextValue = {
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
