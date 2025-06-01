import React, { useState } from "react";
import DisplayRoleInfo from "./DisplayRoleInfo";
import { FaChevronDown, FaChevronUp, FaMusic } from "react-icons/fa";
import  Loading  from "../../utils/Loading"
import  ErrorMessage  from "../../utils/ErrorMessage"
import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import { useInstrumentsDetails } from "../../context/music/InstrumentDetailsContext";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import { useRoles } from "../../context/music/RolesContext";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import RoleItem from "./RoleItem";
import { useTranslation } from "react-i18next";

const DisplayMusicInfo = ({ profileId }) => {
  const { t } = useTranslation("music");
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

  if (error) return <ErrorMessage error={error.message || t("errors.fetch")}  />

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 bg-sky-900/30 rounded-full">
          <FaMusic className="text-sky-400 text-2xl animate-pulse" />
        </div>
        <h3 className="text-3xl font-bold text-sky-500 tracking-wide">
          {t("roles.title")}
        </h3>
      </div>

      {roles.length === 0 ? (
        <p className="text-gray-500">
          {t("roles.none")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <RoleItem
                key={role.id}
                role={role}
                expandedRole={expandedRole}
                handleRoleClick={handleRoleClick}
              />
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