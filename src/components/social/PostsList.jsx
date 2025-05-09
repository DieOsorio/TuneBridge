import React from 'react';
import PostCard from './PostCard';
import Loading from '../../utils/Loading';
import ErrorMessage from '../../utils/ErrorMessage';
import { usePosts } from '../../context/social/PostsContext';
import { useView } from '../../context/ViewContext';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";

const PostsList = ({ profileId, isOwnProfile }) => { 
    const { searchPosts, infinitePosts, infiniteUserPosts } = usePosts();  
    const { 
        data: userPostsData, 
        fetchNextPage: fetchNextPageUser, 
        hasNextPage: hasNextPageUser,
        isFetchingNextPage: isFetchingNextPageUser,
        isLoading: isLoadingUserPosts,
        error: errorUserPosts
    } = infiniteUserPosts(profileId); // Fetch posts based on profileId
    const { 
        data: allPostsData, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage,
        isLoading,
        error 
    } = infinitePosts(); // Fetch all posts for infinite scrolling
    const { manageView } = useView(); // Get manageView function from context
    const navigate = useNavigate(); // For navigation
    const { register, handleSubmit, watch } = useForm(); // react-hook-form for handling the search form
    const searchTerm = watch("searchTerm"); // Watch the search term input

    const { data: searchResults, isLoading: isSearching } = searchPosts(searchTerm); // Use searchPosts hook
    
    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error.message} />;

    // Display all posts or search results
    if (!profileId) return (
        <>
            <div className="flex flex-col mx-auto text-center">
                {/* Search Form */}
                <form onSubmit={handleSubmit(() => {})} className="mb-5">
                    <input
                        type="text"
                        {...register("searchTerm")}
                        placeholder="Search posts..."
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
                        Create Post
                    </Button>
                </div>

                {/* Display Posts */}
                {isSearching ? (
                    <Loading />
                ) : searchTerm && searchResults?.length > 0 ? (
                    searchResults.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : searchTerm ? (
                    <p className="col-span-full text-center text-gray-500">No posts match your search.</p>
                ) : allPostsData && allPostsData.pages.length > 0 ? (
                    allPostsData.pages.map((page, pageIndex) => (
                        <React.Fragment key={pageIndex}>
                            {page.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </React.Fragment>
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No posts available.</p>
                )}

                {/* Load More Button */}
                {hasNextPage && (
                    <Button
                        className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Load More'}
                    </Button>
                )}
            </div>
        </>
    );

    // Display posts for a specific user
    if (isLoadingUserPosts) return <Loading />;
    if (errorUserPosts) return <ErrorMessage error={errorUserPosts.message} />;
    
    return (
        <div className="flex flex-col mx-auto text-center">
            {/* Create a new post */}
            {isOwnProfile && (
                <div className="my-5">
                    <Button
                        className="!w-1/2 md:!w-1/3 !font-bold"
                        color="success"
                        size="large"
                        variant="contained"
                        onClick={() => manageView("createPost", "profile")}
                    >
                        Create Post
                    </Button>
                </div>
            )}
            {userPostsData && userPostsData.pages.length > 0 ? (
                userPostsData.pages.map((page, pageIndex) => (
                    <React.Fragment key={pageIndex}>
                        {page.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </React.Fragment>
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No posts available.</p>
            )}
             {/* Load More Button */}
             {hasNextPageUser && (
                <Button
                    className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
                    onClick={() => fetchNextPageUser()}
                    disabled={isFetchingNextPageUser}
                >
                    {isFetchingNextPageUser ? 'Loading...' : 'Load More'}
                </Button>
            )}
        </div>
    );
};

export default PostsList;
