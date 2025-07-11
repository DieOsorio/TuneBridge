import { useProfileGroups } from "../../../context/profile/ProfileGroupsContext";
import ErrorMessage from "../../../utils/ErrorMessage";
import GroupCard from "./GroupCard";
import GroupCardSkeleton from "./skeletons/GroupCardSkeleton";

const GroupList = () => {
  const { profileGroups, loading, error } = useProfileGroups();

  if (error) {
    return (
      <ErrorMessage error={error.message} />
    );
  }

  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] justify-items-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <GroupCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (!profileGroups || profileGroups.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-10">
        No groups to display.
      </div>
    );
  }

   return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,_minmax(260px,_1fr))] justify-items-center">
      {profileGroups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
};

export default GroupList;
