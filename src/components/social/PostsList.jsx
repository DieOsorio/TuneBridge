import PostCard from './PostCard';
import Loading from '../../utils/Loading';
import ErrorMessage from '../../utils/ErrorMessage';
import { usePosts } from '../../context/social/PostsContext';
import { useView } from '../../context/ViewContext';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PostsList = ({ profileId, isOwnProfile }) => { 
    const { posts: allPosts, userPosts } = usePosts()  
    const { data:posts, isLoading, error } = userPosts(profileId); // Fetch posts based on profileId
    const { manageView } = useView(); // Get manageView function from context
    const navigate = useNavigate(); // For navigation
    
    if (isLoading) return <Loading /> ;
    if (error) return <ErrorMessage error={error.message} />;

    // display all posts
    if (!profileId) return (
        <>
        <div className="flex flex-col mx-auto text-center">
        <div className="my-5">
            <Button
            className="!w-1/2 !font-bold "
            color='success'
            size='large'             
            variant='contained'                
            onClick={() => navigate("/create-post")}                
            >
                Create Post
            </Button>
        </div>
            {allPosts && allPosts.length > 0 ? (
                allPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">No posts available.</p>
            )}
        </div>
        </>
    );

    // display all post from a specific user
    return (
        <div className="flex flex-col mx-auto text-center">
            {/* Create a new post */}
            { isOwnProfile && (
                <div className="my-5">
                    <Button
                    className="!w-1/2 !font-bold"
                    color='success'
                    size='large'             
                    variant='contained'                
                    onClick={() => manageView("createPost", "profile")}                
                    >
                        Create Post
                    </Button>
                </div>
            )}
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
