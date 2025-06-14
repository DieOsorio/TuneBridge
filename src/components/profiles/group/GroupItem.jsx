import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useTranslation } from "react-i18next";

const GroupItem = ({ groupId }) => {
  const { t } = useTranslation("profileGroup");
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const navigate = useNavigate();

  // Fetch the profile group data
  const { data: group, isLoading, error } = fetchProfileGroup(groupId);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return (
      <ErrorMessage error={error.message} />
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
      <img
        src={group.avatar_url || "/default-avatar.png"}
        alt={group.name}
        className="w-20 h-20 rounded-full mb-2"
      />
      <h3 className="text-lg font-semibold text-gray-100">{group.name}</h3>
      <p className="text-sm text-gray-400">{group.bio}</p>
      <Button
        className="mt-4  !bg-amber-700 hover:!bg-amber-800"
        onClick={() => navigate(`/group/${group.id}`)}
      >
        {t("groupItem.viewGroup", "View Group")}
      </Button>
    </div>
  );
};

export default GroupItem;