import React, { useEffect, useState } from "react";
import { useMusic } from "../../context/music/MusicContext";
import { useInstruments } from "../../context/music/InstrumentDetailsContext";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import { useComposerDetails } from "../../context/music/ComposerDetailsContext"; // Import ComposerDetailsContext
import DisplayRoleInfo from "./DisplayRoleInfo";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DisplayMusicInfo = ({ profileId }) => {
  const { roles, loading, error, fetchRolesForProfile } = useMusic();
  const { instruments, fetchInstruments } = useInstruments();
  const { singerDetails, fetchDetails: fetchSingerDetails } = useSingerDetails();
  const { djDetails, fetchDetails: fetchDjDetails } = useDjDetails();
  const { producerDetails, fetchDetails: fetchProducerDetails } = useProducerDetails();
  const { composerDetails, fetchDetails: fetchComposerDetails } = useComposerDetails(); // Use ComposerDetailsContext
  const [expandedRole, setExpandedRole] = useState(null); // Track which role is expanded

  useEffect(() => {
    if (profileId) {
      fetchRolesForProfile(profileId);
    }
  }, [profileId]);

  const handleRoleClick = (role) => {
    if (expandedRole === role.id) {
      setExpandedRole(null); // Collapse if already expanded
    } else {
      setExpandedRole(role.id); // Expand and fetch data for the role

      if (role.role === "Instrumentalist") {
        fetchInstruments(profileId);
      } else if (role.role === "Singer") {
        fetchSingerDetails(role.id); // Fetch singer details using the role ID
      } else if (role.role === "DJ") {
        fetchDjDetails(role.id); // Fetch DJ details using the role ID
      } else if (role.role === "Producer") {
        fetchProducerDetails(role.id); // Fetch producer details using the role ID
      } else if (role.role === "Composer") {
        fetchComposerDetails(role.id); // Fetch composer details using the role ID
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