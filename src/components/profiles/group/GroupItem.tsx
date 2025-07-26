import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import Button from "../../ui/Button";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import ProfileAvatar from "../ProfileAvatar";

interface GroupItemProps {
  groupId: string;
}

const GroupItem = ({ groupId }: GroupItemProps) => {
  const { t } = useTranslation("profileGroup");
  const { fetchProfileGroup } = useProfileGroups();
  const navigate = useNavigate();

  const { data: group, isLoading, error } = fetchProfileGroup(groupId);

  const handleViewGroup = () => {
    if (!group) return;
    navigate(`/group/${group.id}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage error={error.message} />;
  }

  if (!group) return null;

  return (
    <div className="bg-gradient-to-r from-gray-800 p-4 rounded-lg shadow-md flex gap-4 items-center">
      <ProfileAvatar
        avatar_url={group.avatar_url || "/default-avatar.png"}
        alt={group.name}
        className="!w-20 !h-20"
        group={true}
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-100">{group.name}</h3>
        <p className="text-sm text-gray-400">{group.bio}</p>
      </div>
      <Button
        className="ml-auto !bg-amber-800 hover:!bg-amber-900"
        onClick={handleViewGroup}
      >
        {t("groupItem.viewGroup", "View Group")}
      </Button>
    </div>
  );
};

export default GroupItem;
