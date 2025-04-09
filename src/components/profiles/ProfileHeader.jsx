import ProfileAvatar from './ProfileAvatar';
import { useView } from '../../context/ViewContext'
import Button from '../ui/Button';

function ProfileHeader({ isOwnProfile, profileData }) {
    const { setSelectedOption } = useView();
  return (
    <div className="bg-sky-700 mb-4 p-4 rounded-2xl">
        <div className="flex items-center gap-4">
            <ProfileAvatar avatar_url={profileData.avatar_url} />
            <h2 className="text-3xl text-gray-100 font-bold">{profileData.username}</h2>
        </div>

        {/* Display the users posts */}
        <div className="flex justify-end mb-4">
            <Button onClick={() => setSelectedOption("displayPosts")}>Posts</Button>
        </div>

        {/* Create a new post */}
        {isOwnProfile && 
        <div className="flex justify-end mb-4">
            <Button onClick={() => setSelectedOption("createPost")}>Create Post</Button>
        </div>}
    </div>  
  )
}

export default ProfileHeader