import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

import PropTypes from "prop-types";

const SocialContext = createContext(null);
SocialContext.displayName = "SocialContext";

export const SocialProvider = ({ children }) => {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchConnections = async () => {
            setLoading(true);
            setError("");

            try {
                const { data, error } = await supabase
                    .schema("social")
                    .from("user_connections")
                    .select("*")
                    .eq("follower_profile_id", user.id);

                if (error) {
                    throw new Error(error.message);
                }

                setConnections(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConnections();
    }, [user]);

    const followUser = async (profileId) => {
        setLoading(true);
        setError("");

        try {
            // Optimistically update the state
            const newConnection = {
                follower_profile_id: user.id,
                following_profile_id: profileId,
                status: "pending",
            };
            setConnections((prev) => [...prev, newConnection]);

            // Call the server
            const { data, error } = await supabase
                .schema("social")
                .from("user_connections")
                .insert([newConnection]);

            if (error) {
                throw new Error(error.message);
            }

            // Replace the optimistic update with the server response
            if (data && data.length > 0) {
                setConnections((prev) =>
                    prev.map((conn) =>
                        conn.following_profile_id === profileId ? data[0] : conn
                    )
                );
            }
        } catch (error) {
            setError(error.message);
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const unfollowUser = async (profileId) => {
        setLoading(true);
        setError("");

        try {
            // Optimistically remove the connection
            setConnections((prev) =>
                prev.filter((conn) => conn.following_profile_id !== profileId)
            );

            // Call the server
            const { error } = await supabase
                .schema("social")
                .from("user_connections")
                .delete()
                .match({ follower_profile_id: user.id, following_profile_id: profileId });

            if (error) {
                throw new Error(error.message);
            }
        } catch (error) {
            setError(error.message);
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SocialContext.Provider
            value={{
                connections,
                followUser,
                unfollowUser,
                loading,
                error,
            }}
        >
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
};
