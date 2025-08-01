import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePosts } from "../../context/social/PostsContext";

import { Button } from "@mui/material";
import PostCard from "./PostCard";
import PostCardSkeleton from "./skeletons/PostCardSkeleton";
import ErrorMessage from "../../utils/ErrorMessage";

import PlusButton from "../ui/PlusButton";

import type { Post } from "../../context/social/postsActions";

interface FormInputs {
  searchTerm: string;
}

const PostsSearch: React.FC = () => {
  const { t } = useTranslation(["posts", "common"]);
  const { searchPosts, infinitePosts } = usePosts();

  // React Hook Form setup with types
  const { register, handleSubmit, watch } = useForm<FormInputs>({
    defaultValues: { searchTerm: "" },
  });

  const searchTerm = watch("searchTerm");

  // Infinite posts query (no params)
  const {
    data: allPostsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = infinitePosts();

  // Search posts query, enabled only if searchTerm non-empty string
  const {
    data: searchResults,
    isLoading: isSearching,
  } = searchPosts(searchTerm || "");

  // Form submit handler, no real submission, just prevent default
  const onSubmit: SubmitHandler<FormInputs> = () => {};

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center">
        {[...Array(7)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) return <ErrorMessage error={(error as Error).message} />;

  return (
    <div className="flex flex-col mx-auto text-center">
      {/* Search Form + Create Post Icon */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-5 relative flex items-center justify-center"
      >
        <input
          type="text"
          {...register("searchTerm")}
          placeholder={t("posts:placeholders.searchPosts")}
          className="border rounded-lg p-2 focus:outline-none focus:ring w-full max-w-md"
        />
        {/* Desktop: Plus icon beside search */}
        <div className="absolute right-0 top-9 -translate-y-1/2 hidden lg:flex items-center group">
          <PlusButton
            label={t("posts:buttons.createPost")}
            to="/create-post"
            iconSize={28}
            showLabelOnMobile={false}
          />
        </div>
      </form>

      {/* Mobile: Plus icon below search */}
      <div className="flex justify-center items-center lg:hidden mb-4 mr-6">
        <PlusButton
          label={t("posts:buttons.createPost")}
          to="/create-post"
          iconSize={32}
          showLabelOnMobile={true}
        />
      </div>

      {/* Display Posts */}
      {isSearching ? (
        <div className="flex flex-col gap-4 items-center">
          {[...Array(2)].map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : searchTerm && searchResults && searchResults.length > 0 ? (
        searchResults.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : searchTerm ? (
        <p className="col-span-full text-center text-gray-500">
          {t("posts:messages.noMatch")}
        </p>
      ) : Array.isArray(allPostsData?.pages) && allPostsData.pages.length > 0 ? (
        allPostsData.pages.map((page: Post[], pageIndex: number) => (
          <React.Fragment key={pageIndex}>
            {page.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </React.Fragment>
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">
          {t("posts:messages.empty")}
        </p>
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
