import { Link } from "react-router-dom";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";
import { ImCross } from "react-icons/im";
import { FaCheck } from 'react-icons/fa';
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useProfile } from "../../context/profile/ProfileContext";

const ConnectionCard = ({ profileId, id }) => {
    const { fetchProfile } = useProfile(); 
    const { data: profile, isLoading: loading, error } = fetchProfile(profileId);
    const { updateConnection, deleteConnection } = useUserConnections();
    
    
    if (loading) return <Loading />;
    
    if (error) return <ErrorMessage error={error.message || "Error loading profile."} />;

    if (!profile) return null;

    const handleAccept = async() => {
        if (!id) return console.warn("Connection ID is missing");
        await updateConnection({id, updatedConnection: {status: "accepted"}});
    }

    const handleReject = async () => {
        if (!id) return console.warn("Connection ID is missing");
        await deleteConnection(id);
    }

    return (
        <div className="relative flex flex-col w-35 h-65 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm">
            {id && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">                    
                    <button onClick={handleAccept} className="text-green-600 hover:text-green-800">
                        <FaCheck />
                    </button>
                    <button onClick={handleReject} className="text-red-600 hover:text-red-800">
                        <ImCross />
                    </button>
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
