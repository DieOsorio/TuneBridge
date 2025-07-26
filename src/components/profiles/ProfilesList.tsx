import ProfileCard from "./ProfileCard";
import ProfileCardSkeleton from "./skeletons/ProfileCardSkeleton";
import ErrorMessage from "../../utils/ErrorMessage";
import React from "react";

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  gender?: string;
  state?: string;
  country?: string;
  [key: string]: any;
}

export interface ProfilesListProps {
  profiles: Profile[];
  isSearching?: boolean;
  isLoading?: boolean;
  error?: { message: string } | null;
}

const ProfilesList = ({ profiles, isSearching = false, isLoading = false, error }: ProfilesListProps) => {
  const loading = isSearching || isLoading;

  if (error) {
    return <ErrorMessage error={error.message} />;
  }

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
        <ProfileCard key={String(profile.id)} profile={{ ...profile, id: String(profile.id) }} />
      ))}
    </div>
  );
};

export default ProfilesList;
