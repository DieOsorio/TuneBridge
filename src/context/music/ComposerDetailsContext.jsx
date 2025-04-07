import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  fetchComposerQuery,
  addComposerMutation,
  updateComposerMutation,
  deleteComposerMutation,
} from "./ComposerDetailsActions";

const ComposerDetailsContext = createContext();
ComposerDetailsContext.displayName = "ComposerDetailsContext";

export const ComposerDetailsProvider = ({ children }) => {
  const {data, isLoading, error, refetch} = fetchComposerQuery();
  const addComposer = addComposerMutation();
  const updateComposer = updateComposerMutation();
  const deleteComposer = deleteComposerMutation();

  const value ={
      composerDetails: data,
      loading: isLoading,
      error,
      refetch,
      addComposer: addComposer.mutateAsync,
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