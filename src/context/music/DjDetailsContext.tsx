import { createContext, useContext, ReactNode } from "react";
import {
  useFetchDjsQuery,
  useFetchDjById,
  useAddDjMutation,
  useUpdateDjMutation,
  useDeleteDjMutation,
  DjDetails,
  AddDjParams,
  UpdateDjParams,
  DeleteDjParams
} from "./djDetailsActions";
import { UseQueryResult } from "@tanstack/react-query";

interface DjDetailsContextValue {
  djDetails?: DjDetails[];
  loading: boolean;
  error: unknown;
  refetch: () => void;
  fetchDj: (roleId: string) => UseQueryResult<DjDetails[], Error>;
  fetchDjById: (id: string) => UseQueryResult<DjDetails, Error>;
  addDj: (params: AddDjParams) => Promise<DjDetails>;
  updateDj: (params: UpdateDjParams) => Promise<DjDetails>;
  deleteDj: (params: DeleteDjParams) => Promise<void>;
}

const DjDetailsContext = createContext<DjDetailsContextValue | undefined>(undefined);
DjDetailsContext.displayName = "DjDetailsContext";

export const DjDetailsProvider = ({ children }: { children: ReactNode }) => {
  const { data: djDetails, isLoading: loading, error, refetch } = useFetchDjsQuery("");
  const addDj = useAddDjMutation().mutateAsync;
  const updateDj = useUpdateDjMutation().mutateAsync;
  const deleteDj = useDeleteDjMutation().mutateAsync;

  const value: DjDetailsContextValue = {
    djDetails,
    loading,
    error,
    refetch,
    fetchDj: useFetchDjsQuery,
    fetchDjById: useFetchDjById,
    addDj,
    updateDj,
    deleteDj,
  };

  return (
    <DjDetailsContext.Provider value={value}>
      {children}
    </DjDetailsContext.Provider>
  );
};

export const useDjDetails = (): DjDetailsContextValue => {
  const context = useContext(DjDetailsContext);
  if (!context) {
    throw new Error("useDjDetails must be used within a DjDetailsProvider");
  }
  return context;
};
