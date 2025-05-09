import ProfileCard from "./ProfileCard";
import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../utils/Loading";
import ErrorMessage from "../../utils/ErrorMessage";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";

const ProfilesList = () => {
    const { searchProfiles, infiniteProfiles } = useProfile();
    const { user } = useAuth();
    const { register, watch, handleSubmit } = useForm(); // For handling the search form
    const searchTerm = watch("searchTerm"); // Watch the search term input

    // Infinite profiles query
    const {
        data: allProfilesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: profileLoading,
        error: profileError,
    } = infiniteProfiles();

    // Search profiles query
    const { data: searchResults, isLoading: isSearching } = searchProfiles(searchTerm);

    // Handle errors and loading states
    if (profileError) {
        return <ErrorMessage error={profileError.message || "Error when loading profiles."} />;
    }

    if (profileLoading && !allProfilesData) {
        return <Loading />;
    }

    // Filter out the current user from the profiles
    const filteredProfiles = allProfilesData
        ? allProfilesData.pages.flat().filter((profile) => profile.id !== user.id)
        : [];

    const filteredSearchResults = searchResults
        ? searchResults.filter((profile) => profile.id !== user.id)
        : [];

    // Render the profiles
    return (
        <div className="w-full py-4 flex flex-col items-center bg-gradient-to-l to-gray-900">
            {/* Search Form */}
            <form onSubmit={handleSubmit(() => {})} className="mb-5 w-full max-w-md">
                <input
                    type="text"
                    {...register("searchTerm")}
                    placeholder="Search profiles..."
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-brown-300"
                />
            </form>

            {/* Profiles List */}
            <div className="w-full flex flex-wrap justify-center gap-4">
                {isSearching ? (
                    <Loading />
                ) : searchTerm && filteredSearchResults.length > 0 ? (
                    filteredSearchResults.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))
                ) : searchTerm ? (
                    <p className="text-gray-500">No profiles match your search.</p>
                ) : filteredProfiles.length > 0 ? (
                    filteredProfiles.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))
                ) : (
                    <p className="text-gray-500">No profiles available.</p>
                )}
            </div>

            {/* Load More Button */}
            {!searchTerm && hasNextPage && (
                <Button
                    className="!w-1/2 md:!w-1/3 !font-bold mt-4 !mx-auto hover:!text-sky-600"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
            )}
        </div>
    );
};

export default ProfilesList;
