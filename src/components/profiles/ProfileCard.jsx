import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { fetchConnectionsQuery } from "../../context/social/userConnectionsActions";
import { useAuth } from "../../context/AuthContext";
import { IoPersonAdd, IoPersonRemove, IoPersonOutline, IoPerson } from "react-icons/io5";
import { ImBlocked } from "react-icons/im"
import { useView } from "../../context/ViewContext";

const ProfileCard = ({ profile }) => {
    const { user } = useAuth();
    const { data: connections } = fetchConnectionsQuery(profile.id)
    const { addConnection, deleteConnection, updateConnection } = useUserConnections();
    const [hoverText, setHoverText] = useState("");
    const { setSelectedOption } = useView();
    
    const userConnection = connections?.find(
        (conn) => conn.follower_profile_id || conn.following_profile_id === user.id
      );

    const status = userConnection?.status ?? "connect";

    const handleConnect = async () => {
        if (status === "connect") {
            await addConnection({
                follower_profile_id: user.id,
                following_profile_id: profile.id,
                status: "pending",
            }); // Call the server to follow the user        
        } 
        else {
            await deleteConnection(userConnection.id); // Call the server to unfollow the user
        }
    };

    const getHoverText = () => {
        if (status === "pending") return "cancel request";
        else if (status === "accepted") return "unconnect";
        else if (status === "blocked") return "unblocked"; 
        return null
    }

    return (
        <div className={`flex flex-col w-60 h-90 text-gray-800 items-center gap-2 border rounded-lg shadow-sm ${
            status==="accepted" ? ("bg-green-50") : 
            status==="pending" ? ("bg-amber-50") : 
            status==="blocked" ? ("bg-red-50") : 
            "bg-white"
        }`}>
            <Link onClick={() => setSelectedOption("profile")} to={`/profile/${profile.id}`}>
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
                    className="relative font-bold cursor-pointer w-50 bg-gray-500 text-white px-4 py-2 rounded h-10 overflow-hidden flex items-center gap-2"
                    onClick={handleConnect}
                    onMouseEnter={() => setHoverText(getHoverText())}
                    onMouseLeave={() => setHoverText(null)}
                >
                    {/* Ícono alineado a la izquierda del texto */}
                    <span className="pl-1">
                        {status === "connect" && <IoPersonAdd className="text-green-50" />}
                        {status === "accepted" && !hoverText && (
                             <IoPerson className="text-green-50" />
                        )}
                        {status === "pending" && !hoverText && (
                            <IoPersonOutline className="text-yellow-50" />
                        )}
                        {(status === "pending" || status === "accepted") && hoverText && (
                            <IoPersonRemove className="text-red-50" />
                        )}
                        {status === "blocked" && !hoverText && <ImBlocked className="text-red-100" />}
                        {status === "blocked" && hoverText && <IoPerson className="" />}
                    </span>

                    {/* Texto (centrado sobre el resto del botón) */}
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