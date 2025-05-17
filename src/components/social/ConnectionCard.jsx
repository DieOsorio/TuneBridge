import { Link } from "react-router-dom";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";
import { ImCross } from "react-icons/im";
import { FaCheck } from 'react-icons/fa';
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";

const ConnectionCard = ({ profileId, connection }) => {
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

    if (loading) return <Loading />;
    
    if (error) return <ErrorMessage error={error.message || "Error loading profile."} />;

    if (!profile) return null;

    const handleAccept = async() => {
        if (!connection.id) return console.warn("Connection ID is missing");
        await updateConnection({id: connection.id, updatedConnection: {status: "accepted"}});
    }

    const handleReject = async () => {
        if (!connection.id) return console.warn("Connection ID is missing");
        await deleteConnection(connection.id);
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
                    {showMenuTrigger && (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((open) => !open)}
                                className="text-gray-600 hover:text-gray-900"
                                aria-label="Options"
                            >
                                <BsThreeDotsVertical />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                                    <button
                                        onClick={handleReject}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                    >
                                        {connection.status === "accepted" ? "Unconnect" : "Delete Connection"}
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
                {profile.city || profile.country ? (
                    <p className="text-gray-400 text-sm">
                        {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default ConnectionCard;
