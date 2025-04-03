import React, { useState, useEffect } from "react";
import { useSocial } from "../../context/SocialContext";

const ProfileCard = ({ profile }) => {
    const { connections, followUser, unfollowUser } = useSocial();
    const [status, setStatus] = useState("connect");

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
            await followUser(profile.id); // Call the server to follow the user
        } else if (status === "pending" || status === "accepted") {
            setStatus("connect"); // Optimistically update the status
            await unfollowUser(profile.id); // Call the server to unfollow the user
        }
    };

    return (
        <div className="flex flex-col w-60 h-90 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm">
            <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={`${profile.username}'s avatar`}
                className="w-60 h-50 object-cover"
            />
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
                    className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleConnect}
                >
                    {status}
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;