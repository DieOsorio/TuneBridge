import React, { useState } from "react";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import DisplayRoleInfo from "./DisplayRoleInfo";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { fetchInstrumentsQuery } from "../../context/music/instrumentDetailsActions";
import { fetchRolesQuery } from "../../context/music/rolesActions";
import { fetchSingerQuery } from "../../context/music/SingerDetailsActions";
import { fetchComposerQuery } from "../../context/music/ComposerDetailsActions";
import { fetchProducerQuery } from "../../context/music/ProducerDetailsActions";
import { fetchDjQuery } from "../../context/music/djDetailsActions";

const DisplayMusicInfo = ({ profileId }) => {
  const  [roleId, setRoleId]  = useState();
  const { data:roles, isLoading: loading, error} = fetchRolesQuery(profileId);
  const { data:instruments } = fetchInstrumentsQuery(roleId)
  const { data: singerDetails } = fetchSingerQuery(roleId);
  const { data: composerDetails } = fetchComposerQuery(roleId);
  const { data: producerDetails } = fetchProducerQuery(roleId);
  const { data: djDetails } = fetchDjQuery(roleId);
  const [expandedRole, setExpandedRole] = useState(null); // Track which role is expanded

  const handleRoleClick = (role) => {
    if (expandedRole === role.id) {
      setExpandedRole(null); // Collapse if already expanded
    } else {
      setExpandedRole(role.id); // Expand and fetch data for the role

      if (role.role === "Instrumentalist") {   
        setRoleId(role.id) // Fetch instruments using the role ID
      } else if (role.role === "Singer") {
        setRoleId(role.id) // Fetch singer details using the role ID
      } else if (role.role === "DJ") {
        setRoleId(role.id); // Fetch DJ details using the role ID
      } else if (role.role === "Producer") {
        setRoleId(role.id); // Fetch producer details using the role ID
      } else if (role.role === "Composer") {
        setRoleId(role.id); // Fetch composer details using the role ID
      }
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <p className="text-gray-500">Loading music information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg shadow-md">
        <p className="text-red-500">Error loading music information: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Music Roles</h3>
      {roles.length === 0 ? (
        <p className="text-gray-500">No music-related roles found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-lg font-medium text-gray-700 cursor-pointer hover:bg-gray-200`}
                onClick={() => handleRoleClick(role)}
              >
                <span>{role.role}</span>
                <FaChevronDown
                  className={`mt-2 text-gray-500 transition-transform ${
                    expandedRole === role.id ? "rotate-180" : ""
                  }`}
                /> {/* Rotate chevron when expanded */}
              </div>
            ))}
          </div>
          {expandedRole && (
            <div className="mt-6">
              <DisplayRoleInfo
                role={roles.find((role) => role.id === expandedRole)}
                data={
                  roles.find((role) => role.id === expandedRole)?.role === "Instrumentalist"
                    ? instruments
                    : roles.find((role) => role.id === expandedRole)?.role === "Singer"
                    ? singerDetails
                    : roles.find((role) => role.id === expandedRole)?.role === "DJ"
                    ? djDetails
                    : roles.find((role) => role.id === expandedRole)?.role === "Producer"
                    ? producerDetails
                    : composerDetails // Add composerDetails for the Composer role
                }
              />
              <div
                className="flex justify-center mt-4 cursor-pointer"
                onClick={() => setExpandedRole(null)} // Collapse on click
              >
                <FaChevronUp className="text-gray-500" /> {/* Chevron to collapse */}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DisplayMusicInfo;