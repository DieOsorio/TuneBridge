import React, { createContext, useContext, useState} from "react";
import PropTypes from "prop-types";
import { 
    useFetchRolesQuery, 
    useAddRoleMutation, 
    useDeleteRoleMutation } 
    from "./rolesActions";


const RolesContext = createContext(null);
RolesContext.displayName = "RolesContext";

export const RolesProvider = ({ children }) => {

    const {data, isLoading, error, refetch} = useFetchRolesQuery();
    const addRole = useAddRoleMutation();
    const deleteRole = useDeleteRoleMutation();  
    
  const value = {
    roles: data || [],
    loading: isLoading,
    error,
    refetchRoles: refetch,
    fetchRoles: useFetchRolesQuery,
    addRole: addRole.mutateAsync,
    deleteRole: deleteRole.mutateAsync,
  };

  return <RolesContext.Provider value={value}>{children}</RolesContext.Provider>;
};

RolesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useRoles = () => {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error("useRoles must be used within a RolesProvider");
  }
  return context;
};