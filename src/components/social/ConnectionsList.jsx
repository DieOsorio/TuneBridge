import ConnectionCard from './ConnectionCard';
import { fetchConnectionsQuery } from '../../context/social/userConnectionsActions';

function ConnectionsList({ checkStatus, profileId }) {
    const { data: connections } = fetchConnectionsQuery(profileId);

    const filteredConnections = connections?.filter(conn => conn.status === checkStatus) || [];
    
    const getOtherProfileId = (conn) => {
        return conn.following_profile_id === profileId
            ? conn.follower_profile_id
            : conn.following_profile_id;
    };

    return (
        <>
            {checkStatus === "pending" && (
                <>
                <h2 className="text-lg text-center font-semibold">Pending Connections</h2>
                <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-yellow-50">
                    {filteredConnections.map((conn) => (
                        <ConnectionCard
                            key={conn.id}
                            profileId={getOtherProfileId(conn)}
                        />
                    ))}
                </div>
                </>
            )}

            {checkStatus === "accepted" && (
                <>
                    <h2 className="text-2xl font-bold mt-6 mb-4 text-center">Connections</h2>
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