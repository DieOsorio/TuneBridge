import { createContext, useContext, ReactNode } from "react";
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
import { UseQueryResult } from "@tanstack/react-query";

interface InstrumentDetailsContextValue {
  fetchInstruments: (roleId: string) => UseQueryResult<InstrumentDetails[], Error>;
  fetchInstrumentById: (id: string) => UseQueryResult<InstrumentDetails, Error>;
  addInstrument: (params: AddInstrumentParams) => Promise<InstrumentDetails>;
  updateInstrument: (params: UpdateInstrumentParams) => Promise<InstrumentDetails>;
  deleteInstrument: (params: DeleteInstrumentParams) => Promise<void>;
}

const InstrumentDetailsContext = createContext<InstrumentDetailsContextValue | undefined>(undefined);
InstrumentDetailsContext.displayName = "InstrumentDetailsContext";

export const InstrumentDetailsProvider = ({ children }: { children: ReactNode }) => {
  const addInstrument = useAddInstrumentMutation().mutateAsync;
  const updateInstrument = useUpdateInstrumentMutation().mutateAsync;
  const deleteInstrument = useDeleteInstrumentMutation().mutateAsync;

  const value: InstrumentDetailsContextValue = {
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
