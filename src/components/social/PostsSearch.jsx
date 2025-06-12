import React from 'react';
import { useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import ErrorMessage from '../../utils/ErrorMessage';
import { usePosts } from '../../context/social/PostsContext';

const PostsSearch = () => {
    const { t } = useTranslation(["posts", "common"]);
    const { searchPosts, infinitePosts } = usePosts();
    const { register, handleSubmit, watch } = useForm();
    const searchTerm = watch("searchTerm");
    const navigate = useNavigate();

    const {
        data: allPostsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = infinitePosts();

    const {
        data: searchResults,
        isLoading: isSearching
    } = searchPosts(searchTerm);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 items-center">
                {[...Array(7)].map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
        );
    }
    if (error) return <ErrorMessage error={error.message} />;

    return (
        <div className="flex flex-col mx-auto text-center">
            {/* Search Form */}
            <form onSubmit={handleSubmit(() => {})} className="mb-5">
                <input
                    type="text"
                    {...register("searchTerm")}
                    placeholder={t("posts:placeholders.searchPosts")}
                    className="w-3xs border rounded-lg p-2 focus:outline-none focus:ring focus:ring-brown-300"
                />
            </form>

            {/* Create Post Button */}
            <div className="my-5">
                <Button
                    className="!w-1/2 md:!w-1/3 !font-bold"
                    color="success"
                    size="large"
                    variant="contained"
                    onClick={() => navigate("/create-post")}
                >
                    {t("posts:buttons.createPost")}
                </Button>
            </div>

            {/* Display Posts */}
            {isSearching ? (
                <div className="flex flex-col gap-4 items-center">
                    {[...Array(2)].map((_, i) => (
                        <PostCardSkeleton key={i} />
                    ))}
                </div>
            ) : searchTerm && searchResults?.length > 0 ? (
                searchResults.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : searchTerm ? (
                <p className="col-span-full text-center text-gray-500">{t("posts:messages.noMatch")}</p>
            ) : allPostsData && allPostsData.pages.length > 0 ? (
                allPostsData.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </React.Fragment>
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">{t("posts:messages.empty")}</p>
            )}

            {/* Load More Button */}
            {hasNextPage && (
                <Button
                    className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? t("common:loading") : t("common:loadMore")}
                </Button>
            )}
        </div>
    );
};

export default PostsSearch;
