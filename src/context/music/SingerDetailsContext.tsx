import { createContext, useContext, ReactNode } from "react";
import {
  useFetchSingersQuery,
  useFetchSingerById,
  useAddSingerMutation,
  useUpdateSingerMutation,
  useDeleteSingerMutation,
} from "./SingerDetailsActions";

// Context value type
interface SingerDetailsContextValue {
  fetchSinger: typeof useFetchSingersQuery;
  fetchSingerById: typeof useFetchSingerById;
  addSinger: ReturnType<typeof useAddSingerMutation>["mutateAsync"];
  updateSinger: ReturnType<typeof useUpdateSingerMutation>["mutateAsync"];
  deleteSinger: ReturnType<typeof useDeleteSingerMutation>["mutateAsync"];
}

const SingerDetailsContext = createContext<SingerDetailsContextValue | undefined>(undefined);
SingerDetailsContext.displayName = "SingerDetailsContext";

export const SingerDetailsProvider = ({ children }: { children: ReactNode }) => {
  const addSinger = useAddSingerMutation();
  const updateSinger = useUpdateSingerMutation();
  const deleteSinger = useDeleteSingerMutation();

  const value: SingerDetailsContextValue = {
    fetchSinger: useFetchSingersQuery,
    fetchSingerById: useFetchSingerById,
    addSinger: addSinger.mutateAsync,
    updateSinger: updateSinger.mutateAsync,
    deleteSinger: deleteSinger.mutateAsync,
  };

  return (
    <SingerDetailsContext.Provider value={value}>
      {children}
    </SingerDetailsContext.Provider>
  );
};

export const useSingerDetails = () => {
  const context = useContext(SingerDetailsContext);
  if (!context) {
    throw new Error("useSingerDetails must be used within a SingerDetailsProvider");
  }
  return context;
};
