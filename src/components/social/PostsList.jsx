import PostCard from './PostCard';
import { fetchPostsQuery } from '../../context/social/postsActions';
import Loading from '../../utils/Loading';
import ErrorMessage from '../../utils/ErrorMessage';

const PostsList = ({ profileId }) => {
    // Fetch posts based on profileId
    const { data: posts, isLoading, error } = fetchPostsQuery(profileId);

    if (isLoading) return <Loading /> ;
    if (error) return <ErrorMessage error={error.message} />;

    return (
        <div className="flex flex-col mx-auto max-w-[80vw] text-center">
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
