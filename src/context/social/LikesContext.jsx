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
  const { data, isLoading, error, refetch } = useFetchLikesQuery();
  const useUserLikes = useUserLikesQuery();
  const useInsertLike = useInsertLikeMutation();
  const useUpdateLike = useUpdateLikeMutation();
  const useDeleteLike = useDeleteLikeMutation();

  const value = {
    likes: data,
    loading: isLoading,
    error,
    refetch,
    useUserLikes: useUserLikes,
    useInsertLike: useInsertLike.mutateAsync,
    useUpdateLike: useUpdateLike.mutateAsync,
    useDeleteLike: useDeleteLike.mutateAsync,
  };

  return(
    <LikesContext.Provider
    value={value}>
      {children}
    </LikesContext.Provider>  
  )
};

LikesProvider.PropTypes = {
  children: PropTypes.node.isRequired,
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error("useLies must be used within a LikesProvider")
  }
  return context;
};