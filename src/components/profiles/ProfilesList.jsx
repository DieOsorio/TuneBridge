import React, { useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { useProfile } from '../../context/profile/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import Loading from '../../utils/Loading';
import Error from '../../utils/Error';



const ProfilesList = () => {
    const { allProfiles, fetchAllProfiles, loading:profileLoading, error:profileError } = useProfile();
    const { followUser, connections, loading:socialLoading, error:socialError } = useSocial();
    const { user } = useAuth();

    const filteredProfiles = allProfiles.filter(profile => profile.id !== user.id);
    

    if(socialError || profileError) {
        return <Error error={socialError} />
    }

    if (!allProfiles) {
        return <Loading />;
    }

    useEffect(() => {
        fetchAllProfiles();
    }, []);


    return (
        <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-gray-200">
        {filteredProfiles.map(profile => {
            const connection = connections.find(conn => conn.following_profile_id === profile.id);
            return (
                <ProfileCard
                    key={profile.id}
                    userId={profile.id}
                    className="flex flex-col w-60 h-90 text-gray-800 bg-gray-100 items-center gap-2 border rounded-lg shadow-sm"
                    imageClass="w-60 h-50 object-cover"
                    avatar_url={profile.avatar_url}
                    city={profile.city}
                    country={profile.country}
                    username={profile.username}
                    connect={() => followUser(profile.id)}
                    status={connection ? connection.status : "connect"}
                    // Agrega aquí más props según sea necesario
                />
            )
        })}
        </div>
    );
};

export default ProfilesList;
