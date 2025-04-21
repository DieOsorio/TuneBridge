import ConnectionCard from './ConnectionCard';
import { useFetchConnectionsQuery } from '../../context/social/userConnectionsActions';

function ConnectionsList({ checkStatus, profileId }) {
    const { data: connections } = useFetchConnectionsQuery(profileId);

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

    const bgClass = checkStatus === 'accepted' ? 'bg-green-50' : 'bg-yellow-50';
    const title = checkStatus === 'accepted' ? 'Connections' : 'Pending Connections';

    return (
        <>
            <h2 className="text-lg text-center font-semibold">{title}</h2>
            <div className={`w-full py-4 flex flex-wrap justify-center gap-4 ${bgClass}`}>
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
