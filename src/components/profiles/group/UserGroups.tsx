import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useProfileGroupMembers } from "@/context/profile/ProfileGroupMembersContext";

import GroupItem from "./GroupItem";
import ErrorMessage from "@/utils/ErrorMessage";
import Loading from "@/utils/Loading";
import ShinyText from "../../ui/ShinyText";
import PlusButton from "../../ui/PlusButton";

type UserGroupsProps = {
  profileId: string;
  isOwnProfile: boolean;
};

const UserGroups= ({ profileId, isOwnProfile }:UserGroupsProps) => {
  const { t } = useTranslation("profileGroup");
  const { groupId } = useParams(); // Not used here, but might be useful for context
  const { user } = useAuth();
  const { fetchUserGroups } = useProfileGroupMembers();

  const {
    data: groupsIds,
    isLoading,
    error,
  } = fetchUserGroups(profileId);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="bg-gradient-to-l to-gray-900 p-6 rounded-b-lg shadow-lg max-w-4xl mx-auto">
      {/* Title */}
      <h2 className="text-3xl font-semibold text-center mb-4 tracking-wide">
        <ShinyText
          text={t("userGroups.groups")}
          style={{ "--shiny-primary": "#d97706cc" } as React.CSSProperties}
          className="!text-amber-600"
          speed={3}
        />
      </h2>

      {/* Group List */}
      {!groupsIds || groupsIds.length === 0 ? (
        <p className="text-gray-400 text-center">
          {isOwnProfile
            ? t("userGroups.notInAnyGroups")
            : t("userGroups.userNotInAnyGroups")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groupsIds.map((group) => (
            <GroupItem key={group.id} groupId={group.id} />
          ))}
        </div>
      )}

      {/* Create Group Button */}
      {isOwnProfile && (
        <div className="mt-6 flex justify-start">
          <PlusButton
            label={t("userGroups.createNewGroup")}
            to="/create-profile-group"
            color="amber"
            slide="right"
          />
        </div>
      )}
    </div>
  );
};

export default UserGroups;
