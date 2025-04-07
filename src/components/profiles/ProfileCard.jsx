import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserConnections } from "../../context/social/UserConnectionsContext";

const ProfileCard = ({ profile }) => {
    const { connections, addConnection, deleteConnection } = useUserConnections();
    const [status, setStatus] = useState("connect");
    const [hoverText, setHoverText] = useState("");

    useEffect(() => {        
        // Find the connection for this profile
        const connection = connections.find(
            (conn) => conn.following_profile_id === profile.id
        );
        setStatus(connection ? connection.status : "connect");
    }, [connections, profile.id]);

    const handleConnect = async () => {
        if (status === "connect") {
            setStatus("pending"); // Optimistically update the status
            await addConnection(profile.id); // Call the server to follow the user
        } else if (status === "pending" || status === "accepted") {
            setStatus("connect"); // Optimistically update the status
            await deleteConnection(profile.id); // Call the server to unfollow the user
        }
    };

    const getHoverText = () => {
        if (status === "pending") return "cancel request";
        else if (status === "accepted") return "unconnect"; 
        return null
    }

    return (
        <div className="flex flex-col w-60 h-90 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm">
            <Link to={`/profile/${profile.id}`}>
            <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={`${profile.username}'s avatar`}
                className="w-60 h-50 object-cover"
            />
            </Link>
            <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.username}</h3>
                {profile.city && profile.country ? (
                    <p className="text-gray-400">
                        {profile.city}, {profile.country}
                    </p>
                ) : profile.country ? (
                    <p className="text-gray-400">{profile.country}</p>
                ) : profile.city ? (
                    <p className="text-gray-400">{profile.city}</p>
                ) : null}
            </div>
            <div className="mt-auto py-4">
                <button
                    className="relative  cursor-pointer w-50 bg-blue-400 text-white px-4 py-2 rounded h-10 overflow-hidden"
                    onClick={handleConnect}
                    onMouseEnter={() => setHoverText(getHoverText())}
                    onMouseLeave={() => setHoverText(null)}
                >
                    <span
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-400 ${
                        hoverText ? "opacity-0" : "opacity-100"
                        }`}
                        >
                        {status}
                        </span>
                        <span
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-400 ${
                        hoverText ? "opacity-100" : "opacity-0"
                        }`}
                        >
                        {hoverText || ""}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;