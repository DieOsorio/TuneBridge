import ProfileCard from "./ProfileCard";
import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utils/Loading";
import Error from "../../utils/Error";

const ProfilesList = () => {
    const { allProfiles, loading: profileLoading, error: profileError } = useProfile();
    const { user } = useAuth();

    // Filter out the current user from the profiles
    const filteredProfiles = allProfiles ? allProfiles.filter((profile) => profile.id !== user.id) : [];
    
    // Handle errors and loading states
    if (profileError) {
        return <Error error={profileError.message || "Error when loading profiles."} />;
    }

    if (profileLoading || !allProfiles) {
        return <Loading />;
    }

    // Render the profiles
    return (
        <div className="w-full py-4 flex flex-wrap justify-center gap-4 bg-gray-200">
            {filteredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
            ))}
        </div>
    );
};

export default ProfilesList;
