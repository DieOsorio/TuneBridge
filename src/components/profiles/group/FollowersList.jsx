import { useAuth } from "../../../context/AuthContext";
import { useProfileGroupFollows } from "../../../context/groups/ProfileGroupFollowsContext";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import ConnectionCard from "../../social/ConnectionCard";
import ConnectionCardSkeleton from "../../social/skeletons/ConnectionCardSkeleton";
import ErrorMessage from "../../../utils/ErrorMessage";


const FollowersList = ({ groupId }) => {
  const { user } = useAuth();
  const { t } = useTranslation("profileGroup", { keyPrefix: "followersList" });
  const { followersInfiniteQuery } = useProfileGroupFollows();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = followersInfiniteQuery(groupId);

  const allFollowers = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? [];
  }, [data]);


  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ConnectionCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorMessage error={error.message} />;

  if (allFollowers?.length === 0) {
    return <p className="text-gray-400">{t("connection.messages.noFollowers")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* followers grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 mx-auto sm:mx-0 sm:mr-auto gap-4">
        {allFollowers.map((follower) => (
          <ConnectionCard
            key={follower.follow_id}
            profileId={follower.follower_profile_id}
            ownProfile={false}
          />
        ))}
      </div>

      {/* load more */}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="self-center cursor-pointer mt-4 px-4 py-2 rounded bg-amber-950 text-white hover:bg-amber-800"
        >
          {isFetchingNextPage ? t("connection.loadingMore") : t("connection.loadMore")}
        </button>
      )}
    </div>
  );
};

export default FollowersList;
