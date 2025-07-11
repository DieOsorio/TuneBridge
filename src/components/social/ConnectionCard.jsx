import { Link } from "react-router-dom";
import { useState } from "react";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

import { BsThreeDotsVertical } from "react-icons/bs";
import { ImCross } from "react-icons/im";
import { FaCheck } from 'react-icons/fa';

import ErrorMessage from "../../utils/ErrorMessage";
import ConnectionCardSkeleton from "./skeletons/ConnectionCardSkeleton";

const ConnectionCard = ({ profileId, connection, ownProfile }) => {
    const { t } = useTranslation("profile");
    const { user } = useAuth();
    const currentProfileId = user?.id; // Get the logged-in user's ID

    const { fetchProfile } = useProfile(); 
    const { updateConnection, deleteConnection } = useUserConnections();
    
    const { data: profile, isLoading: loading, error } = fetchProfile(profileId);

    // Only show accept/reject if pending and current user is the one being followed
    const showAcceptReject = connection.status === "pending" && connection.following_profile_id === currentProfileId;

    // Show delete if accepted and current user is part of the connection
    const showDelete = connection.status === "accepted" &&
        (connection.following_profile_id === currentProfileId || connection.follower_profile_id === currentProfileId);

    // Only show the three dots menu for the current logged-in profile
    const showMenuTrigger = currentProfileId === connection.follower_profile_id || currentProfileId === connection.following_profile_id;

    const [menuOpen, setMenuOpen] = useState(false);

    if (loading) return <ConnectionCardSkeleton />;
    
    if (error) return <ErrorMessage error={error.message} />;

    if (!profile) return null;

    const handleAccept = async() => {
        if (!connection.id) return console.warn("Connection ID is missing");
        await updateConnection({
            connection, 
            updatedConnection: {status: "accepted"}
        });
    }

    const handleReject = async () => {
        if (!connection.id) return console.warn("Connection ID is missing");
        await deleteConnection(connection);
    }

    return (
        <div className="relative flex flex-col w-35 h-65 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm">
            {connection.id && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                    {showAcceptReject && (
                        <>
                            <button onClick={handleAccept} className="text-green-600 hover:text-green-800">
                                <FaCheck />
                            </button>
                            <button onClick={handleReject} className="text-red-600 hover:text-red-800">
                                <ImCross />
                            </button>
                        </>
                    )}
                    {showMenuTrigger && !showAcceptReject && ownProfile && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((open) => !open)}
                                className="text-gray-950 hover:text-orange-700 cursor-pointer"
                                aria-label={t("connection.connectionCard.options")}                                
                            >
                                <BsThreeDotsVertical title={t("connection.connectionCard.options")} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-gray-900 border rounded shadow-lg z-50">
                                    <button
                                        onClick={handleReject}
                                        className="block w-full cursor-pointer text-center px-4 py-2 text-red-500 hover:text-red-600"
                                    >
                                        {connection.status === "accepted" ? t("connection.connectionCard.disconnect") : t("connection.connectionCard.delete")}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <Link to={`/profile/${profileId}`}>
                <img
                    src={profile.avatar_url || "/default-avatar.png"}
                    alt={`${profile.username}'s avatar`}
                    className="w-60 h-40 object-cover rounded-t-lg"
                />
            </Link>

            <div className="text-center px-2 pb-2">
                <h3 className="font-semibold text-lg">{profile.username}</h3>
                {profile.state || profile.country ? (
                    <p className="text-gray-400 text-sm">
                        {[profile.state, profile.country].filter(Boolean).join(", ")}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default ConnectionCard;
