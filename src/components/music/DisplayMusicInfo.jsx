import React, { useState } from "react";
import DisplayRoleInfo from "./DisplayRoleInfo";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import  Loading  from "../../utils/Loading"
import  ErrorMessage  from "../../utils/ErrorMessage"
import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import { useInstrumentsDetails } from "../../context/music/InstrumentDetailsContext";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import { useRoles } from "../../context/music/RolesContext";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";

const DisplayMusicInfo = ({ profileId }) => {
  const  [roleId, setRoleId]  = useState();
  const { fetchRoles } = useRoles();
  const { data: roles, isLoading: loading, error} = fetchRoles(profileId);
  const { fetchInstruments } = useInstrumentsDetails();
  const { data:instruments } = fetchInstruments(roleId)
  const { fetchSinger } = useSingerDetails();
  const { data: singerDetails } = fetchSinger(roleId);
  const { fetchComposer } = useComposerDetails();
  const { data: composerDetails } = fetchComposer(roleId);
  const { fetchProducer } = useProducerDetails();
  const { data: producerDetails } = fetchProducer(roleId);
  const { fetchDj } = useDjDetails();
  const { data: djDetails } = fetchDj(roleId);
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
  
  if (loading) return <Loading />

  if (error) return <ErrorMessage error={error.message} />

  return (
    <div className="bg-sky-100 p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4 text-center">Music Roles</h3>
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