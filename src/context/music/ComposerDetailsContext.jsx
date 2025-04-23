import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchComposerQuery,
  useAddComposerMutation,
  useUpdateComposerMutation,
  useDeleteComposerMutation,
} from "./ComposerDetailsActions";

const ComposerDetailsContext = createContext();
ComposerDetailsContext.displayName = "ComposerDetailsContext";

export const ComposerDetailsProvider = ({ children }) => {
  const {data: composerDetails, isLoading: loading, error, refetch} = useFetchComposerQuery();
  const addComposer = useAddComposerMutation();
  const updateComposer = useUpdateComposerMutation();
  const deleteComposer = useDeleteComposerMutation();

  const value ={
      composerDetails,
      loading,
      error,
      refetch,
      addComposer: addComposer.mutateAsync,
      fetchComposer: useFetchComposerQuery,
      updateComposer: updateComposer.mutateAsync,
      deleteComposer: deleteComposer.mutateAsync,
    }

  return (
    <ComposerDetailsContext.Provider
      value={value}
    >
      {children}
    </ComposerDetailsContext.Provider>
  );
};

ComposerDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useComposerDetails = () => {
  const context = useContext(ComposerDetailsContext);
  if (!context) {
    throw new Error("useComposerDetails must be used within a ComposerDetailsProvider");
  }
  return context;
};