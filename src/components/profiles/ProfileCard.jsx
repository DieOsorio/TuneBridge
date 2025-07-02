import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserConnections } from "../../context/social/UserConnectionsContext";
import { useAuth } from "../../context/AuthContext";
import { IoPersonAdd, IoPersonRemove, IoPersonOutline, IoPerson } from "react-icons/io5";
import { ImBlocked } from "react-icons/im"
import { useView } from "../../context/ViewContext";
import ProfileAvatar from "./ProfileAvatar";
import { useTranslation } from "react-i18next";

const ProfileCard = ({ profile }) => {
    const { t } = useTranslation("profile");
    const { user } = useAuth();
    const loggedIn = Boolean(user);
    const { addConnection, deleteConnection, userConnections, updateConnection } = useUserConnections();
    const { data: connections } = userConnections(profile.id)
    const [hoverText, setHoverText] = useState("");
    const { manageView } = useView();

    const navigate = useNavigate();
    
    // Find the connection status between the logged-in user and the profile
    const userConnection = loggedIn && connections?.find(
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
        if (!loggedIn) {
            navigate("/login");
            return;
        }
        
        if (status === "connect") {
            await addConnection({
                follower_profile_id: user.id,
                following_profile_id: profile.id,
                status: "pending",
            }); // Call the server to follow the user
        } else if (status === "pending") {
            await deleteConnection(userConnection); // Call the server to unfollow the user
        } else if (status === " accepted") {
            await deleteConnection(userConnection); // Call the server to unconnect the user
        } else if (status === "blocked") {
            await updateConnection({
                connection: userConnection,
                updatedConnection: {
                    status: "accepted",
                },
            }); // Call the server to unblock the user
        }
    };

    // Function to determine the hover text based on the connection status
    const getHoverText = () => {
        if (status === "pending") return t("connection.cancelRequest");
        else if (status === "accepted") return t("connection.disconnect");
        else if (status === "blocked") return t("connection.unblock"); 
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
                {profile.state && profile.country ? (
                    <p className="text-gray-500">
                        {profile.state}, {profile.country}
                    </p>
                ) : profile.country ? (
                    <p className="text-gray-500">{profile.country}</p>
                ) : profile.state ? (
                    <p className="text-gray-500">{profile.state}</p>
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
                        className={`absolute inset-0 text-[13px] flex items-center justify-center transition-opacity duration-400 ${
                            hoverText ? "opacity-0" : "opacity-100"
                        }`}
                    >
                        {t(`connection.${status}`)}
                    </span>
                    <span
                        className={`absolute inset-0 text-[13px] flex items-center justify-center transition-opacity duration-400 ${
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