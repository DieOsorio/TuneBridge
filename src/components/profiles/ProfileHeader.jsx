import ProfileAvatar from './ProfileAvatar';
import { useView } from '../../context/ViewContext'
import Button from '../ui/Button';
import { BsFillBellFill } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { IoChatboxSharp } from "react-icons/io5";

function ProfileHeader({ isOwnProfile, profileData }) {
    const { manageView, setExternalView } = useView();

  return (
    <div className="bg-gradient-to-b from-sky-700 to-sky-900 mb-4 p-4 rounded-b-lg">
        <div className='flex'>
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => manageView("about", "profile")}>                
                <ProfileAvatar avatar_url={profileData.avatar_url} />
                <h2 className="text-3xl text-gray-100 font-bold">{profileData.username}</h2>
            </div>

            <div className="ml-auto flex gap-4">
                    <IoChatboxSharp className='w-8 h-8 text-white cursor-pointer' onClick={() => manageView("about", "profile")} />
                    {isOwnProfile && <IoIosSettings className='w-8 h-8 text-white cursor-pointer' onClick={() => manageView("editProfile", "edit")} />}
                    {isOwnProfile && <BsFillBellFill className='w-7 h-7 text-white cursor-pointer' onClick={() => manageView("pending", "notifications")} />}
            </div>
        </div>

        <div className='flex justify-end gap-4'>
            {/* Display the users posts */}
            <div>
                <div className="mb-4">
                    <Button onClick={() => manageView("about", "profile")}>About</Button>
                </div>
                <div className="mb-4">
                    <Button onClick={() => manageView("about", "profile")}>Music</Button>
                </div>
            </div>

            <div>
                {/* Display the users posts */}
                <div className="mb-4">
                    <Button onClick={() => setExternalView("displayPosts")}>Posts</Button>
                </div>

                {/* Create a new post */}
                {isOwnProfile && 
                <div className="mb-4">
                    <Button onClick={() => setExternalView("createPost")}>Create Post</Button>
                </div>}
            </div>
        </div>
    </div>  
  )
}

export default ProfileHeader