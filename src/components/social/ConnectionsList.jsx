import ConnectionCard from './ConnectionCard';
import { useUserConnections } from '../../context/social/UserConnectionsContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

function ConnectionsList({ checkStatus, profileId, maxVisible  }) {
    const { user } = useAuth();
    const { t } = useTranslation("ui", { keyPrefix: "connections" });
    const { userConnections } = useUserConnections()
    const { data: connections } = userConnections(profileId);

    const ownProfile = profileId ===  user.id;
       
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

    const getOtherProfileId = (conn) => {
        return conn.following_profile_id === profileId
            ? conn.follower_profile_id
            : conn.following_profile_id;
    };

    const title = checkStatus === 'accepted' ? t("title") : null;

    // Show count for accepted connections
    const showCount = checkStatus === 'accepted';

    const display = maxVisible
        ? filteredConnections.slice(0, maxVisible)
        : filteredConnections;

    return (
        <div className={`max-w-4xl mx-auto w-full bg-gradient-to-l from-gray-900 py-4 flex flex-wrap justify-center rounded-lg gap-4`}>
            <div className="w-full flex items-center justify-between px-4 mb-2">
                <h2 className="text-xl font-bold text-white">
                  {title}
                  {showCount && (
                    <span className="ml-2 text-sky-400 text-lg font-semibold">({filteredConnections.length})</span>
                  )}
                </h2>
            </div>
            {display.length > 0  
            ? display.map((conn) => (
                <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    profileId={getOtherProfileId(conn)}
                    ownProfile={ownProfile}
                />
            ))
            : <div className="text-gray-400">
                {checkStatus === 'pending' 
                ? t("noPendingConnections") 
                : t("noConnections")
              }</div>
            }
            {maxVisible && filteredConnections.length > maxVisible && (
                <Link
                to={`/profile/${profileId}/connections`}
                className="w-full text-center text-sky-400 hover:underline mt-2 block"
                >
                {t("viewAll")}
                </Link>
            )}
        </div>
    );
}

export default ConnectionsList;
