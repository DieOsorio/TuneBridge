import { createContext, useContext, ReactNode } from "react";
import {
  useFetchComposersQuery,
  useFetchComposerById,
  useAddComposerMutation,
  useUpdateComposerMutation,
  useDeleteComposerMutation,
  ComposerDetails,
  AddComposerParams,
  UpdateComposerParams,
  DeleteComposerParams
} from "./ComposerDetailsActions";
import { UseQueryResult } from "@tanstack/react-query";

interface ComposerDetailsContextValue {
  addComposer: (params: AddComposerParams) => Promise<ComposerDetails>;
  fetchComposer: (roleId: string) => UseQueryResult<ComposerDetails[], Error>;
  fetchComposerById: (id: string) => UseQueryResult<ComposerDetails, Error>;
  updateComposer: (params: UpdateComposerParams) => Promise<ComposerDetails>;
  deleteComposer: (params: DeleteComposerParams) => Promise<void>;
}

const ComposerDetailsContext = createContext<ComposerDetailsContextValue | undefined>(undefined);
ComposerDetailsContext.displayName = "ComposerDetailsContext";

export const ComposerDetailsProvider = ({ children }: { children: ReactNode }) => {
  const addComposer = useAddComposerMutation();
  const updateComposer = useUpdateComposerMutation();
  const deleteComposer = useDeleteComposerMutation();

  const value: ComposerDetailsContextValue = {
    addComposer: addComposer.mutateAsync,
    fetchComposer: useFetchComposersQuery,
    fetchComposerById: useFetchComposerById,
    updateComposer: updateComposer.mutateAsync,
    deleteComposer: deleteComposer.mutateAsync,
  };

  return (
    <ComposerDetailsContext.Provider value={value}>
      {children}
    </ComposerDetailsContext.Provider>
  );
};

export const useComposerDetails = (): ComposerDetailsContextValue => {
  const context = useContext(ComposerDetailsContext);
  if (!context) {
    throw new Error("useComposerDetails must be used within a ComposerDetailsProvider");
  }
  return context;
};
