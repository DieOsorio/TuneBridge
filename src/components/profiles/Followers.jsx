import React, { useEffect, useState } from 'react';
import { useSocial } from '../../context/SocialContext';
import { useProfile } from '../../context/profile/ProfileContext';
import ProfileCard from './ProfileCard';


const Followers = () => {
  const { connections, loading, error } = useSocial();
  const { fetchProfile } = useProfile();
  const [followers, setFollowers] = useState([]);
  console.log("FOLLOWERS render");
    
  useEffect(() => {
    const fetchFollowers = async () => {
        if (!connections || connections.length === 0) return;

        try {
            const profiles = await Promise.all(connections.map(async (conn) => {
                    const profile = await fetchProfile(conn.following_profile_id);
                    return profile;
                }))

            setFollowers(profiles);
        } catch (error) {
            console.error("❌ Error obteniendo los perfiles:", error);
        }
    };

    fetchFollowers();
  }, [connections]);
  

  if (loading) return <div className="text-center py-4">Cargando seguidores...</div>;
  if (error) return <div className="text-red-500 text-center">Error al cargar los seguidores.</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Seguidores</h2>
      {followers.length === 0 ? (
        <p className="text-gray-500 text-center">Aún no tienes seguidores.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {followers.map((profile) => (
            profile && (
              <ProfileCard 
                key={profile.id} 
                userId={profile.id} 
                avatar_url={profile.avatar_url}
                username={profile.username}
                imageClass="w-12 h-12 rounded-full object-cover"
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Followers;
