import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useAuth } from "../../context/AuthContext";
import { IoPersonAdd, IoPersonRemove, IoPersonOutline, IoPerson } from "react-icons/io5";
import { ImBlocked } from "react-icons/im"
import { useView } from "../../context/ViewContext";
import ProfileAvatar from "./ProfileAvatar";

const ProfileCard = ({ profile }) => {
    const { user } = useAuth();
    const { addConnection, deleteConnection, userConnections } = useUserConnections();
    const { data: connections } = userConnections(profile.id)
    const [hoverText, setHoverText] = useState("");
    const { manageView } = useView();
    
    // Find the connection status between the logged-in user and the profile
    const userConnection = connections?.find(
        (conn) => {
            const isLoggedUserInvolved = 
                (conn.follower_profile_id === user.id && conn.following_profile_id === profile.id) ||
                (conn.follower_profile_id === profile.id && conn.following_profile_id === user.id)
            return isLoggedUserInvolved;
        }
      );
          
    const status = userConnection?.status ?? "connect";
    
    // Function to handle connection status change
    const handleConnect = async () => {
        if (status === "connect") {
            await addConnection({
                follower_profile_id: user.id,
                following_profile_id: profile.id,
                status: "pending",
            }); // Call the server to follow the user
        } else {
            await deleteConnection(userConnection.id); // Call the server to unfollow the user
        }
    };

    // Function to determine the hover text based on the connection status
    const getHoverText = () => {
        if (status === "pending") return "cancel request";
        else if (status === "accepted") return "unconnect";
        else if (status === "blocked") return "unblocked"; 
        return null
    }

    return (
        <div className="flex flex-col w-60 h-90 text-gray-800 items-center gap-2 border rounded-lg shadow-sm bg-gray-200">
            {/* Profile avatar with link to profile */}
            <Link onClick={() => manageView("about", "profile")} to={`/profile/${profile.id}`}>
            <ProfileAvatar
                avatar_url={profile.avatar_url}
                alt={`${profile.username}'s avatar`}
                className="object-cover h-50 w-60"
                list={true}
                gender={profile.gender}
            />
            </Link>
            {/* Profile name and location */}
            <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.username}</h3>
                {profile.city && profile.country ? (
                    <p className="text-gray-500">
                        {profile.city}, {profile.country}
                    </p>
                ) : profile.country ? (
                    <p className="text-gray-500">{profile.country}</p>
                ) : profile.city ? (
                    <p className="text-gray-500">{profile.city}</p>
                ) : null}
            </div>

            <div className="mt-auto py-4">
                <button
                    className="relative font-bold cursor-pointer w-50 bg-gray-500 text-white px-4 py-2 rounded h-10 overflow-hidden flex items-center gap-2"
                    onClick={handleConnect}
                    onMouseEnter={() => setHoverText(getHoverText())}
                    onMouseLeave={() => setHoverText(null)}
                >
                    {/* Icon aligned to the left of the text */}
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

                    {/* Text (centered over the rest of the button) */}
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