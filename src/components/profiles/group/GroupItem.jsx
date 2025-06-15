import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/Button";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { useTranslation } from "react-i18next";
import { useView } from "../../../context/ViewContext";

const GroupItem = ({ groupId }) => {
  const { t } = useTranslation("profileGroup");
  const { fetchProfileGroup } = useProfileGroups(); // Fetch group details
  const navigate = useNavigate();
  const { manageView } = useView();

  // Fetch the profile group data
  const { data: group, isLoading, error } = fetchProfileGroup(groupId);

  const handleViewGroup = () => {
    manageView("members", "group");
    navigate(`/group/${group.id}`);
  }

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
        onClick={handleViewGroup}
      >
        {t("groupItem.viewGroup", "View Group")}
      </Button>
    </div>
  );
};

export default GroupItem;