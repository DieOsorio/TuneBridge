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
import ErrorMessage from "../../utils/ErrorMessage";
import DisplayRoleInfo from "./DisplayRoleInfo";
import RoleItem from "./RoleItem";
import ShinyText from "../ui/ShinyText";
import MediaSummary from "./MediaSummary";
import PlusButton from "../ui/PlusButton";
import RoleItemSkeleton from "./skeletons/RoleItemSkeleton";
import DisplayRoleInfoSkeleton from "./skeletons/DisplayRoleInfoSkeleton";
import React from "react";

interface DisplayMusicInfoProps {
  profileId: string;
}

const DisplayMusicInfo: React.FC<DisplayMusicInfoProps> = ({ profileId }) => {
  const { t } = useTranslation("music");
  const { user } = useAuth();
  const [roleId, setRoleId] = useState<string>();
  const { fetchRoles } = useRoles();
  const { data: roles, isLoading: loadingRoles, error } = fetchRoles(profileId);
  const { fetchInstruments } = useInstrumentsDetails();
  const { data: instruments, isLoading: loadingInstrument } = fetchInstruments(roleId ?? "");
  const { fetchSinger } = useSingerDetails();
  const { data: singerDetails, isLoading: loadingSinger } = fetchSinger(roleId ?? "");
  const { fetchComposer } = useComposerDetails();
  const { data: composerDetails, isLoading: loadingComposer } = fetchComposer(roleId ?? "");
  const { fetchProducers } = useProducerDetails();
  const { data: producerDetails, isLoading: loadingProducer } = fetchProducers(roleId ?? "");
  const { fetchDj } = useDjDetails();
  const { data: djDetails, isLoading: loadingDj } = fetchDj(roleId ?? "");
  const [expandedRole, setExpandedRole] = useState<string | number | undefined>(undefined);

  const ownProfile = user && user.id === profileId;
  const loading = loadingRoles || loadingInstrument || loadingSinger || loadingComposer || loadingProducer || loadingDj;

  const handleRoleClick = (role: any) => {
    if (expandedRole === role.id) {
      setExpandedRole(undefined);
    } else {
      setExpandedRole(role.id);
      setRoleId(role.id);
    }
  };

  if (error) return <ErrorMessage error={error.message || t("errors.fetch")} />;

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md w-full">
      <div className="flex items-center justify-center font-semibold gap-3 mb-6">
        <ShinyText text={t("roles.title")} speed={3} className="text-3xl tracking-wide" />
      </div>
      <MediaSummary profileId={profileId} />
      {ownProfile && (
        <PlusButton label={t("roles.addRole")} to="/settings/music" onClick={() => {}} />
      )}
      {roles && roles.length === 0 ? (
        <p className="text-gray-400 text-center">{t("roles.none")}</p>
      ) : roles ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && !roles.length ? (
              [...Array(3)].map((_, i) => <RoleItemSkeleton key={i} />)
            ) : (
              roles.map((role: any) => (
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
                (() => {
                  const foundRole = roles.find((role: any) => role.id === expandedRole);
                  let data: any[] = [];
                  if (foundRole) {
                    switch (foundRole.role) {
                      case "Instrumentalist":
                        data = instruments ?? [];
                        break;
                      case "Singer":
                        data = singerDetails ?? [];
                        break;
                      case "DJ":
                        data = djDetails ?? [];
                        break;
                      case "Producer":
                        data = Array.isArray(producerDetails) ? producerDetails : producerDetails ? [producerDetails] : [];
                        break;
                      case "Composer":
                        data = composerDetails ?? [];
                        break;
                      default:
                        data = [];
                    }
                    return <DisplayRoleInfo role={foundRole} data={data} />;
                  }
                  return null;
                })()
              )}
              <div className="flex justify-center mt-4 cursor-pointer" onClick={() => setExpandedRole(undefined)}>
                <FaChevronUp className="text-gray-500" />
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default DisplayMusicInfo;
