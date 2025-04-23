import PostCard from './PostCard';
import Loading from '../../utils/Loading';
import ErrorMessage from '../../utils/ErrorMessage';
import { usePosts } from '../../context/social/PostsContext';

const PostsList = ({ profileId }) => { 
    const { posts: allPosts, userPosts } = usePosts()  
    const { data:posts, isLoading, error } = userPosts(profileId); // Fetch posts based on profileId
    
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
