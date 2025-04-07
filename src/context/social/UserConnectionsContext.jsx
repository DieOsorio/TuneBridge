import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "../../supabase";
import {
  fetchUserConnections,
  addUserConnection,
  updateUserConnection,
  deleteUserConnection,
} from "./userConnectionsActions";

const UserConnectionsContext = createContext();
UserConnectionsContext.displayName = "UserConnectionsContext";

export const UserConnectionsProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const { data, error } = await supabase
          .schema("social")
          .from("user_connections")
          .select("*")
        if (error) throw error;
  
        setConnections(data);
      } catch (err) {
        console.error("Error fetching connections:", err)        
        throw err;
      }
    };

    fetchConnections();
  }, []);

  const value = useMemo(
    () => ({
      connections,
      loading,
      error,
      fetchConnections: async (profileId) => {
        return await fetchUserConnections(supabase, profileId, setConnections, setError, setLoading);
      },
      addConnection: async (connection) => {
        return await addUserConnection(supabase, connection, setError, setLoading);
      },
      updateConnection: async (id, updatedConnection) => {
        return await updateUserConnection(supabase, id, updatedConnection, setError, setLoading);
      },
      deleteConnection: async (id) => {
        return await deleteUserConnection(supabase, id, setError, setLoading);
      },
    }),
    [connections, loading, error]
  );

  return (
    <UserConnectionsContext.Provider
      value={value}
    >
      {children}
    </UserConnectionsContext.Provider>
  );
};

UserConnectionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUserConnections = () => {
  const context = useContext(UserConnectionsContext);
  if (!context) {
    throw new Error("useUserConnections must be used within a UserConnectionsProvider");
  }
  return context;
};