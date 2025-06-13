import React from 'react';
import { useForm } from "react-hook-form";
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import ErrorMessage from '../../utils/ErrorMessage';
import { usePosts } from '../../context/social/PostsContext';
import { FiPlus } from 'react-icons/fi';

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
            {/* Search Form + Create Post Icon */}
            <form onSubmit={handleSubmit(() => {})} className="mb-5 relative flex items-center justify-center">
                <input
                    type="text"
                    {...register("searchTerm")}
                    placeholder={t("posts:placeholders.searchPosts")}
                    className="border rounded-lg p-2 focus:outline-none focus:ring w-full max-w-md"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center group">
                    <button
                        type="button"
                        onClick={() => navigate("/create-post")}
                        className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    >
                        <FiPlus size={28} />
                    </button>
                    <span
                        className="ml-2 whitespace-nowrap text-emerald-500 font-semibold text-base bg-gray-900 px-3 py-1 rounded-lg shadow transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none"
                        style={{ willChange: 'opacity, transform' }}
                    >
                        {t("posts:buttons.createPost")}
                    </span>
                </div>
            </form>

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
