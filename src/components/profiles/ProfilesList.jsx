import ProfileCard from "./ProfileCard";
import ProfileCardSkeleton from "./ProfileCardSkeleton";

const ProfilesList = ({ profiles, isSearching }) => {
    if (isSearching) {
        return (
            <div className="flex flex-col gap-4 items-center">
                {[...Array(3)].map((_, i) => (
                    <ProfileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!profiles || profiles.length === 0) {
        return <p className="text-gray-500">No profiles available.</p>;
    }

    return (
        <div className="w-full flex flex-wrap justify-center gap-4">
            {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
            ))}
        </div>
    );
};

export default ProfilesList;
