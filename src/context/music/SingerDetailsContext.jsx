import React, { createContext, useContext} from "react";
import PropTypes from "prop-types";
import {
  useFetchSingersQuery,
  useFetchSingerById,
  useAddSingerMutation,
  useUpdateSingerMutation,
  useDeleteSingerMutation,
} from "./SingerDetailsActions";

const SingerDetailsContext = createContext();
SingerDetailsContext.displayName = "SingerDetailsContext";

export const SingerDetailsProvider = ({ children }) => {
  const {data: singerDetails, isLoading: loading, error, refetch} = useFetchSingersQuery();
  const addSinger = useAddSingerMutation();
  const updateSinger = useUpdateSingerMutation();
  const deleteSinger = useDeleteSingerMutation();

  const value = {
        singerDetails,
        loading,
        error,
        refetch,
        fetchSinger: useFetchSingersQuery,
        fetchSingerById: useFetchSingerById,
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