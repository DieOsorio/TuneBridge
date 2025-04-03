import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

import PropTypes from "prop-types";

const SocialContext = createContext(null);
SocialContext.displayName = "SocialContext";

export const SocialProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar conexiones del usuario al montar el contexto
  useEffect(() => {
    if (!user) return;
    
    const fetchConnections = async () => {
        setLoading(true);
        setError("")

        try {
            const { data, error } = await supabase
            .schema('social')
            .from("user_connections")
            .select("*")
            .eq("follower_profile_id", user.id);

            setConnections(data);
        } catch (error) {
           setError(error.message) 
        } finally {
            setLoading(false)
        }     
    };
    
    fetchConnections();
  }, [user]);

  // Función para seguir a un usuario
  const followUser = async (followingId) => {
    setLoading(true);
    setError("");

    // Verifica si el usuario ya está en connections
    if (connections.some(conn => conn.following_profile_id === followingId) || followingId === user.id) {
      setLoading(false);
      return;
  }
    try {
        const { data, error } = await supabase
        .schema('social')
        .from("user_connections")
        .insert([{ 
        follower_profile_id: user.id, 
        following_profile_id: followingId, 
        status: "pending" 
        }]);
        
        if (data && Array.isArray(data) && data.length > 0) {
            setConnections(prev => [...prev, data[0]]);
        }
    } catch (error) {
        setError(error.message);
        console.error(error.message)
    } finally {
        setLoading(false);
    }
  };

  // Función para dejar de seguir a un usuario
  const unfollowUser = async (followingId) => {
    setLoading(true);
    setError('');

    try {
        const { error } = await supabase
        .schema('social')
        .from("user_connections")
        .delete()
        .match({ follower_profile_id: user.id, following_profile_id: followingId });

        setConnections((prev) => prev.filter(conn => conn.following_profile_id !== followingId));
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
  };

  const value = useMemo(() => ({connections, loading, error, followUser, unfollowUser}))

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};

SocialProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) {
        throw new Error("useSocial debe usarse dentro de un SocialProvider");
    }
    return context;
}
