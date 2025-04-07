import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  fetchSingerQuery,
  addSingerMutation,
  updateSingerMutation,
  deleteSingerMutation,
} from "./SingerDetailsActions";

const SingerDetailsContext = createContext();
SingerDetailsContext.displayName = "SingerDetailsContext";

export const SingerDetailsProvider = ({ children }) => {
  const {data, isLoading, error, refetch} = fetchSingerQuery();
  const addSinger = addSingerMutation();
  const updateSinger = updateSingerMutation();
  const deleteSinger = deleteSingerMutation();

  const value = {
        singerDetails: data,
        loading: isLoading,
        error,
        refetch,
        addSinger: addSinger.mutateAsync,
        updateSinger: updateSinger.mutateAsync,
        deleteSinger: deleteSinger.mutateAsync,
      }

  return (
    <SingerDetailsContext.Provider
      value={value}
    >
      {children}
    </SingerDetailsContext.Provider>
  );
};

SingerDetailsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSingerDetails = () => {
  const context = useContext(SingerDetailsContext);
  if (!context) {
    throw new Error("useSinger must be used within an SingerDetailsProvider");
  }
  return context;
};