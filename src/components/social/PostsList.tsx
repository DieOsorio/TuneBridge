import { usePosts } from '../../context/social/PostsContext';
import { useTranslation } from 'react-i18next';

import PostCard from './PostCard';
import ErrorMessage from '../../utils/ErrorMessage';
import PostCardSkeleton from './skeletons/PostCardSkeleton';
import { Button } from '@mui/material';
import PostsSearch from './PostsSearch';
import PlusButton from '../ui/PlusButton';

import type { Post } from '@/context/social/postsActions';

interface PostsListProps {
  profileId?: string;
  posts?: Post[];
  disableSearch?: boolean;
  isOwnProfile?: boolean;
}

const PostsList = ({
  profileId,
  posts,
  disableSearch = false,
  isOwnProfile = false,
}: PostsListProps) => {
  const { t } = useTranslation(["posts", "common"]);
  const { infiniteUserPosts } = usePosts();

  const {
    data: userPostsData,
    fetchNextPage: fetchNextPageUser,
    hasNextPage: hasNextPageUser,
    isFetchingNextPage: isFetchingNextPageUser,
    isLoading: isLoadingUserPosts,
    error: errorUserPosts,
  } = infiniteUserPosts(profileId ?? "", 10);

  // Show search if no profileId and search not disabled
  if (!profileId && !disableSearch) return <PostsSearch />;

  // Loading skeleton
  if (isLoadingUserPosts) {
    return (
      <div className="flex flex-col gap-4 items-center">
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (errorUserPosts) return <ErrorMessage error={(errorUserPosts as Error).message} />;

  const allUserPosts = userPostsData ? userPostsData.pages.flat() : [];

  // If posts prop given (e.g. hashtag page)
  if (posts) {
    return (
      <div className="mx-auto text-center w-full">
        <div className="grid grid-cols-1 gap-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="col-span-full text-center text-gray-400">
              {t("posts:messages.empty")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto text-center w-full">
      {isOwnProfile && (
        <div className="w-full flex justify-end mb-4 relative">
          <div className="group flex items-center">
            <PlusButton
              label={t("posts:buttons.createPost")}
              to="/create-post"
              iconSize={28}
              showLabelOnMobile={true}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {allUserPosts.length > 0 ? (
          allUserPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            {t("posts:messages.empty")}
          </p>
        )}
      </div>

      {hasNextPageUser && (
        <Button
          className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
          onClick={() => fetchNextPageUser()}
          disabled={isFetchingNextPageUser}
        >
          {isFetchingNextPageUser ? t("common:loading") : t("common:loadMore")}
        </Button>
      )}
    </div>
  );
};

export default PostsList;
