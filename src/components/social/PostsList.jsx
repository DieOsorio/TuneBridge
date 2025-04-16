import PostCard from './PostCard';
import { useFetchPostsQuery, useUserPostsQuery } from '../../context/social/postsActions';
import Loading from '../../utils/Loading';
import ErrorMessage from '../../utils/ErrorMessage';

const PostsList = ({ profileId }) => {    
    const { data:posts, isLoading, error } = useUserPostsQuery(profileId); // Fetch posts based on profileId
    const {data: allPosts} = useFetchPostsQuery() //fetch all posts
    
    if (isLoading) return <Loading /> ;
    if (error) return <ErrorMessage error={error.message} />;

    // display all posts
    if (!profileId) return (
        <div className="flex flex-col mx-auto text-center">
            {allPosts && allPosts.length > 0 ? (
                allPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No posts available.</p>
            )}
        </div>
    );

    // display all post from a specific user
    return (
        <div className="flex flex-col mx-auto text-center">
            {posts && posts.length > 0 ? (
                posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No posts available.</p>
            )}
        </div>
    );
}

export default PostsList;
