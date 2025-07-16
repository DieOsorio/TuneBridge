import React, { createContext, useContext, ReactNode } from "react";
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
import { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

interface ComposerDetailsContextValue {
  composerDetails?: ComposerDetails[];
  loading: boolean;
  error: unknown;
  refetch: () => void;
  addComposer: (params: AddComposerParams) => Promise<ComposerDetails>;
  fetchComposer: (roleId: string) => UseQueryResult<ComposerDetails[], Error>;
  fetchComposerById: (id: string) => UseQueryResult<ComposerDetails, Error>;
  updateComposer: (params: UpdateComposerParams) => Promise<ComposerDetails>;
  deleteComposer: (params: DeleteComposerParams) => Promise<void>;
}

const ComposerDetailsContext = createContext<ComposerDetailsContextValue | undefined>(undefined);
ComposerDetailsContext.displayName = "ComposerDetailsContext";

export const ComposerDetailsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // NOTE: You must pass a roleId to useFetchComposersQuery, so this context should be refactored to accept it as a prop or from a parent context
  // For now, we'll use an empty string as a placeholder
  const { data: composerDetails, isLoading: loading, error, refetch } = useFetchComposersQuery("");
  const addComposer = useAddComposerMutation();
  const updateComposer = useUpdateComposerMutation();
  const deleteComposer = useDeleteComposerMutation();

  const value: ComposerDetailsContextValue = {
    composerDetails,
    loading,
    error,
    refetch,
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
