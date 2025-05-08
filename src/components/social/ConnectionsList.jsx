import ConnectionCard from './ConnectionCard';
import { useUserConnections } from '../../context/social/UserConnectionsContext';

function ConnectionsList({ checkStatus, profileId }) {
    const { userConnections } = useUserConnections()
    const { data: connections } = userConnections(profileId);

    // Return null if checkStatus isn't valid or there is no connections
    if (!['accepted', 'pending', 'blocked'].includes(checkStatus)) {
        return null;
    }

    if (!connections) {
        return null;
    }

    // Filtered connections by status
    const filteredConnections = connections.filter((conn) => {
        if (checkStatus === 'accepted') {
            return conn.status === 'accepted';
        }
        if (checkStatus === 'blocked') {
            return conn.status === 'blocked';
        }
        if (checkStatus === 'pending') {
            return conn.status === 'pending' && conn.following_profile_id === profileId;
        }
        return false;
    });

    // If there is not filtered connections return null
    if (filteredConnections.length === 0) {
        return null;
    }

    const getOtherProfileId = (conn) => {
        return conn.following_profile_id === profileId
            ? conn.follower_profile_id
            : conn.following_profile_id;
    };

    const title = checkStatus === 'accepted' ? 'Connections' : 'Pending Connections';

    return (
        <>
            <h2 className="text-lg text-center font-semibold">{title}</h2>
            <div className={`w-full bg-gradient-to-l from-gray-900 py-4 flex flex-wrap justify-center rounded-lg gap-4`}>
                {filteredConnections.map((conn) => (
                    <ConnectionCard
                        key={conn.id}
                        id={conn.id}
                        profileId={getOtherProfileId(conn)}
                    />
                ))}
            </div>
        </>
    );
}

export default ConnectionsList;
