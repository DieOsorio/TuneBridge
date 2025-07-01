import PostCard from './PostCard';
import ErrorMessage from '../../utils/ErrorMessage';
import PostCardSkeleton from './PostCardSkeleton';
import { usePosts } from '../../context/social/PostsContext';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PostsSearch from './PostsSearch';
import PlusButton from "../social/ads/PlusButton";

const PostsList = ({ profileId, posts, disableSearch, isOwnProfile }) => {
    const { t } = useTranslation(["posts", "common"]) 
    const { infiniteUserPosts } = usePosts();  
    const { 
        data: userPostsData, 
        fetchNextPage: fetchNextPageUser, 
        hasNextPage: hasNextPageUser,
        isFetchingNextPage: isFetchingNextPageUser,
        isLoading: isLoadingUserPosts,
        error: errorUserPosts
    } = infiniteUserPosts(profileId); // Fetch posts based on profileId

    // Display all posts or search results
    if (!profileId && !disableSearch) return <PostsSearch />;

    // Display posts for a specific user
    if (isLoadingUserPosts) {
       return (
        <div className="flex flex-col gap-4 items-center">
            {[...Array(3)].map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    )};

    if (errorUserPosts) return <ErrorMessage error={errorUserPosts.message} />;

    const allUserPosts = userPostsData ? userPostsData.pages.flat() : [];

    // If posts are provided (e.g. from hashtag page), render them directly
    if (posts) {
        return (
            <div className="mx-auto text-center w-full">
                <div className="grid grid-cols-1 gap-4">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">
                            {t("posts:messages.empty")}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto text-center w-full">
            {/* Create Post Icon for own profile */}
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
                    allUserPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">
                        {t("posts:messages.empty")}
                    </p>
                )}
            </div>
            {/* Load More Button */}
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
