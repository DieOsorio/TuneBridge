import ConnectionCard from './ConnectionCard';
import { useFetchConnectionsQuery } from '../../context/social/userConnectionsActions';

function ConnectionsList({ checkStatus, profileId }) {
    const { data: connections } = useFetchConnectionsQuery(profileId);
    
    const filteredConnections =
        connections?.filter((conn) => {
            if (checkStatus === 'accepted') {
                return conn.status === 'accepted';
            }

            if (checkStatus === 'pending') {
                return conn.status === 'pending' && conn.following_profile_id === profileId;
            }

            return false;
        }) || [];
    
    const getOtherProfileId = (conn) => {
        return conn.following_profile_id === profileId
            ? conn.follower_profile_id
            : conn.following_profile_id;
    };
    

    return (
        <>
            {filteredConnections.length > 0 && checkStatus === "pending" && (
                <>
                <h2 className="text-lg text-center font-semibold">Pending Connections</h2>
                <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-yellow-50">
                    {filteredConnections.map((conn) => (
                        <ConnectionCard
                            key={conn.id}
                            id={conn.id}
                            profileId={getOtherProfileId(conn)}
                        />
                    ))}
                </div>
                </>
            )}


            
            {filteredConnections.length > 0 && checkStatus === "accepted" && (
                <>
                    <h2 className="text-lg text-center font-semibold">Connections</h2>
                    <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-green-50">
                        {filteredConnections.map((conn) => (
                            <ConnectionCard
                                key={conn.id}
                                profileId={getOtherProfileId(conn)}
                            />
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

export default ConnectionsList;