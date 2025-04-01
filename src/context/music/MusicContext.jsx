import React, { createContext, useContext, useState } from "react";
import { fetchRoles, addRole, deleteRole } from "./musicActions";

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRolesForProfile = async (profileId) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchRoles(profileId);
      setRoles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRoleForProfile = async (profileId, roleName) => {
    setLoading(true);
    setError("");
    try {
      const newRole = await addRole(profileId, roleName);
      if (Array.isArray(newRole)) {
        setRoles((prevRoles) => [...prevRoles, ...newRole]); // Add the new role(s) to the state
      } else {
        console.error("Unexpected response format from addRole:", newRole);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoleForProfile = async (roleId) => {
    setLoading(true);
    setError("");
    try {
      await deleteRole(roleId);
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        roles,
        loading,
        error,
        fetchRolesForProfile,
        addRoleForProfile,
        deleteRoleForProfile,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);