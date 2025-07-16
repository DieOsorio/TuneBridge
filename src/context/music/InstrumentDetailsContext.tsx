import React, { createContext, useContext, ReactNode } from "react";
import {
  useFetchInstrumentsQuery,
  useFetchInstrumentById,
  useAddInstrumentMutation,
  useUpdateInstrumentMutation,
  useDeleteInstrumentMutation,
  InstrumentDetails,
  AddInstrumentParams,
  UpdateInstrumentParams,
  DeleteInstrumentParams
} from "./instrumentDetailsActions";
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface InstrumentDetailsContextValue {
  instruments?: InstrumentDetails[];
  loading: boolean;
  error: unknown;
  refetch: () => void;
  fetchInstruments: (roleId: string) => UseQueryResult<InstrumentDetails[], Error>;
  fetchInstrumentById: (id: string) => UseQueryResult<InstrumentDetails, Error>;
  addInstrument: (params: AddInstrumentParams) => Promise<InstrumentDetails>;
  updateInstrument: (params: UpdateInstrumentParams) => Promise<InstrumentDetails>;
  deleteInstrument: (params: DeleteInstrumentParams) => Promise<void>;
}

const InstrumentDetailsContext = createContext<InstrumentDetailsContextValue | undefined>(undefined);
InstrumentDetailsContext.displayName = "InstrumentDetailsContext";

export const InstrumentDetailsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // NOTE: You must pass a roleId to useFetchInstrumentsQuery, so this context should be refactored to accept it as a prop or from a parent context
  // For now, we'll use an empty string as a placeholder
  const { data: instruments, isLoading: loading, error, refetch } = useFetchInstrumentsQuery("");
  const addInstrument = useAddInstrumentMutation().mutateAsync;
  const updateInstrument = useUpdateInstrumentMutation().mutateAsync;
  const deleteInstrument = useDeleteInstrumentMutation().mutateAsync;

  const value: InstrumentDetailsContextValue = {
    instruments,
    loading,
    error,
    refetch,
    fetchInstruments: useFetchInstrumentsQuery,
    fetchInstrumentById: useFetchInstrumentById,
    addInstrument,
    updateInstrument,
    deleteInstrument,
  };

  return <InstrumentDetailsContext.Provider value={value}>{children}</InstrumentDetailsContext.Provider>;
};

export const useInstrumentsDetails = (): InstrumentDetailsContextValue => {
  const context = useContext(InstrumentDetailsContext);
  if (!context) {
    throw new Error("useInstruments must be used within an InstrumentsProvider");
  }
  return context;
};
