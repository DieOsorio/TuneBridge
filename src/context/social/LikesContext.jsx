import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import {
  useFetchLikesQuery,
  useUserLikesQuery,
  useInsertLikeMutation,
  useUpdateLikeMutation,
  useDeleteLikeMutation,
} from "./likesActions";

const LikesContext = createContext();
LikesContext.displayName = "LikesContext";

export const LikesProvider = ({children}) => {
  const { data: likes, isLoading: loading, error, refetch } = useFetchLikesQuery();
  const insertLike = useInsertLikeMutation().mutateAsync;
  const updateLike = useUpdateLikeMutation().mutateAsync;
  const deleteLike = useDeleteLikeMutation().mutateAsync;

  const value = {
    likes,
    loading,
    error,
    refetch,
    userLikes: useUserLikesQuery,
    insertLike,
    updateLike,
    deleteLike,
  };

  return(
    <LikesContext.Provider
    value={value}>
      {children}
    </LikesContext.Provider>  
  )
};

LikesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLikes must be used within a LikesProvider")
  }
  return context;
};