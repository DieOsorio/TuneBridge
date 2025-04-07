import React, { use, useEffect, useState } from 'react'
import { useUserConnections } from '../../context/social/UserConnectionsContext'
import ConnectionCard from './ConnectionCard' 

function ConnectionsList({checkStatus, id}) {
    const { connections } = useUserConnections()
    const [userConnections, setUserConnections] = useState([])
    
    useEffect(() => {
        const fetchUserConnections = async () => {
            try {
                const filteredConnections = connections.filter(conn => conn.follower_profile_id === id)
                setUserConnections(filteredConnections)
            } catch (err) {
                console.error("Error fetching user connections:", err)
            }
        }
        fetchUserConnections()      
    }, [connections])
    const pendingConnections = userConnections.filter(conn => conn.status === "pending")
    const acceptedConnections = userConnections.filter(conn => conn.status === "accepted")
    console.log("pendingConnections", pendingConnections);
    
      
  return (
    <>
    {checkStatus === "pending" ? (
        <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-gray-200">
            <h2 className="text-lg font-semibold">Pending Connections</h2>
            {pendingConnections.map((conn) => (
                <ConnectionCard key={conn.id} profileId={conn.following_profile_id} /> 
            ))}
        </div>
    ) : checkStatus === "accepted" ? (
        <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-gray-200">
            <h2 className="text-lg font-semibold">Accepted Connections</h2>
            {acceptedConnections.map((conn) => (
                <ConnectionCard key={conn.id} profileId={conn.following_profile_id} /> 
            ))}
        </div>
    ) : null}
    </>)
}

export default ConnectionsList