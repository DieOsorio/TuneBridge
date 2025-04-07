import { useEffect, useState } from "react";
import { useProfileQuery } from "../../context/profile/profileActions";
import Loading from "../../utils/Loading";

const ConnectionCard = ({ profileId }) => {
    const { data: profile, isLoading: loading, error } = useProfileQuery(profileId);
    
    if (loading) return <Loading />;
    
    if (error) return <Error error={error.message || "Error loading profile."} />;

    if (!profile) return null;

    return (
        <div className="flex flex-col w-60 h-90 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm">
            <img
                src={profile.avatar_url || "/default-avatar.png"}
                alt={`${profile.username}'s avatar`}
                className="w-60 h-50 object-cover"
            />
            <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.username}</h3>
                {profile.city || profile.country ? (
                    <p className="text-gray-400">
                        {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </p>
                ) : null}
            </div>
        </div>
    );
};

export default ConnectionCard;
