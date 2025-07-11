import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import { useInstrumentsDetails } from "../../context/music/InstrumentDetailsContext";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import { useRoles } from "../../context/music/RolesContext";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";

import { FaChevronUp } from "react-icons/fa";

import ErrorMessage  from "../../utils/ErrorMessage"
import DisplayRoleInfo from "./DisplayRoleInfo";
import RoleItem from "./RoleItem";
import ShinyText from "../ui/ShinyText";
import MediaSummary from "./MediaSummary";
import PlusButton from "../ui/PlusButton";
import RoleItemSkeleton from "./skeletons/RoleItemSkeleton";
import DisplayRoleInfoSkeleton from "./skeletons/DisplayRoleInfoSkeleton";


const DisplayMusicInfo = ({ profileId }) => {
  const { t } = useTranslation("music");
  const { user } = useAuth();
  const  [roleId, setRoleId]  = useState();
  const { fetchRoles } = useRoles();
  const { data: roles, isLoading: loadingRoles, error} = fetchRoles(profileId);
  const { fetchInstruments } = useInstrumentsDetails();
  const { data:instruments, isLoading: loadingInstrument } = fetchInstruments(roleId)
  const { fetchSinger } = useSingerDetails();
  const { data: singerDetails, isLoading: loadingSinger } = fetchSinger(roleId);
  const { fetchComposer } = useComposerDetails();
  const { data: composerDetails, isLoading: loadingComposer } = fetchComposer(roleId);
  const { fetchProducer } = useProducerDetails();
  const { data: producerDetails, isLoading: loadingProducer } = fetchProducer(roleId);
  const { fetchDj } = useDjDetails();
  const { data: djDetails, isLoading: loadingDj } = fetchDj(roleId);
  const [expandedRole, setExpandedRole] = useState(null); // Track which role is expanded
  
  const ownProfile = user.id === profileId;
  const loading = loadingRoles || loadingInstrument || loadingSinger || loadingComposer || loadingProducer || loadingDj;
  
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
  
  // if (loading) return <DisplayMusicInfoSkeleton />

  if (error) return <ErrorMessage error={error.message || t("errors.fetch")}  />

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full">
      <div className="flex items-center justify-center font-semibold gap-3 mb-6">          
        <ShinyText text={t("roles.title")} speed={3} className="text-3xl tracking-wide"/>    
      </div>

      <MediaSummary profileId={profileId} />

      {ownProfile && (
        <PlusButton
          label={t("roles.addRole")}
          to="/settings/music"
        />
      )}
      {roles?.length === 0 ? (
        <p className="text-gray-400 text-center">
          {t("roles.none")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && !roles?.length ? (
              [...Array(3)].map((_, i) => <RoleItemSkeleton key={i} />)
            ) : (
              roles?.map((role) => (
                <RoleItem
                  key={role.id}
                  role={role}
                  expandedRole={expandedRole}
                  handleRoleClick={handleRoleClick}
                />
              ))
            )}
          </div>
          {expandedRole && (
            <div className="mt-6">
              {loading ? (
                <DisplayRoleInfoSkeleton />
              ) : (
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
                      : composerDetails
                  }
                />
              )}
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