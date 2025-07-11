import ProfileCard from "./ProfileCard";
import ProfileCardSkeleton from "./skeletons/ProfileCardSkeleton";

const ProfilesList = ({ profiles, isSearching, isLoading, error }) => {
    const loading = isSearching || isLoading

    if (error)
    return (
      <ErrorMessage
        error={error.message}
      />
    );

    if (loading) {
        return (
            <div className="w-full flex flex-wrap justify-center gap-4">
                {[...Array(4)].map((_, i) => (
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
