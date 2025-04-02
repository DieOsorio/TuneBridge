import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import { fetchRoles, addRole, deleteRole } from "./musicActions";

const MusicContext = createContext(null);
MusicContext.displayName = "MusicContext";

export const MusicProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = useMemo(
    () => ({
      roles,
      loading,
      error,
      fetchRolesForProfile: async (profileId) => {
        await fetchRoles(supabase, profileId, setRoles, setError, setLoading);
      },
      addRoleForProfile: async (profileId, roleName) => {
        await addRole(supabase, profileId, roleName, setRoles, setError, setLoading);
      },
      deleteRoleForProfile: async (roleId) => {
        await deleteRole(supabase, roleId, setRoles, setError, setLoading);
      },
    }),
    [roles, loading, error]
  );

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};

MusicProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};