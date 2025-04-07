import { useEffect } from "react";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useAuth } from "../../context/AuthContext";
import ConnectionsCard from "./ConnectionsCard";

const Connections = () => {
    const { connections, fetchConnections, updateStatus } = useUserConnections();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchConnections(user.id);
        }
    }, [user, fetchConnections]);

    const handleAcceptRequest = async (connectionId) => {
        await updateStatus(connectionId, "accepted");
        fetchConnections(user.id);
    };

    const getOtherProfileId = (conn) =>
        conn.follower_profile_id === user.id
            ? conn.following_profile_id
            : conn.follower_profile_id;

    return (
        <div className="flex flex-col gap-4 p-4">
            <h2 className="text-xl font-semibold">Tus Conexiones</h2>

            {/* Conexiones Aceptadas */}
            <div>
                <h3 className="text-lg font-medium">Conexiones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections
                        .filter(conn => conn.status === "accepted")
                        .map(conn => (
                            <ConnectionsCard
                                key={conn.id}
                                profileId={getOtherProfileId(conn)}
                            />
                        ))}
                </div>
            </div>

            {/* Solicitudes Pendientes */}
            <div>
                <h3 className="text-lg font-medium">Solicitudes Pendientes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connections
                        .filter(conn => conn.status === "pending")
                        .map(conn => (
                            <ConnectionsCard
                                key={conn.id}
                                profileId={getOtherProfileId(conn)}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default Connections;
