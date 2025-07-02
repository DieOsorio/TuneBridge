import { useProfile } from "../../context/profile/ProfileContext";
import { useAuth } from "../../context/AuthContext";
import ErrorMessage from "../../utils/ErrorMessage";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import { useForm } from "react-hook-form";
import { Button } from "@mui/material";
import ProfilesList from "./ProfilesList";
import Select from "../ui/Select";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ProfilesSearch = () => {
    const { t } = useTranslation("searchProfiles");
    const { searchProfiles, infiniteProfiles } = useProfile();
    const { user } = useAuth();
    const loggedIn = Boolean(user);
    const { register, watch, handleSubmit } = useForm();
    const [showFilters, setShowFilters] = useState(false);
    const searchTerm = watch("searchTerm");
    const country = watch("country");
    const state = watch("state");
    const neighborhood = watch("neighborhood");
    const role = watch("role");
    const instrument = watch("instrument");

    // Infinite profiles query
    const {
        data: allProfilesData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: profileLoading,
        error: profileError,
    } = infiniteProfiles();

    // Compose the effective search term by combining searchTerm and selected filters
    let effectiveSearchTerm = searchTerm || "";
    if (country) effectiveSearchTerm += ` ${country}`;
    if (state) effectiveSearchTerm += ` ${state}`;
    if (neighborhood) effectiveSearchTerm += ` ${neighborhood}`;
    if (role) effectiveSearchTerm += ` ${role}`;
    if (instrument) effectiveSearchTerm += ` ${instrument}`;

    // Always call searchProfiles with the composed string
    const { data: searchResults = [], isLoading: isSearching } = searchProfiles(effectiveSearchTerm.trim() || undefined);

    if (profileError) {
        return <ErrorMessage error={profileError.message || "Error when loading profiles."} />;
    }

    if (profileLoading && !allProfilesData) {
        return (
            <div className="flex flex-col gap-4 items-center">
                {[...Array(7)].map((_, i) => (
                    <ProfileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Filter out the current user from the profiles
    const flatAllProfiles = allProfilesData
        ? allProfilesData.pages.flat()
        : [];

    const filteredProfiles = loggedIn
        ? flatAllProfiles.filter((profile) => profile.id !== user.id)
        : flatAllProfiles;

    const filteredSearchResults = loggedIn
        ? searchResults.filter((profile) => profile.id !== user.id)
        : searchResults;

    // Decide which profiles to show
    let profilesToShow = [];
    if (isSearching) {
        profilesToShow = null; // Show skeletons
    } else if (effectiveSearchTerm && filteredSearchResults.length > 0) {
        profilesToShow = filteredSearchResults;
    } else if (effectiveSearchTerm) {
        profilesToShow = [];
    } else {
        profilesToShow = filteredProfiles;
    }

    // Define filter configs for generalization using i18n
    const filterConfigs = [
        {
            id: "country",
            defaultOption: t("country.defaultOption"),
            options: [
                { value: "Uruguay", label: t("country.options.0.label") },
                { value: "Argentina", label: t("country.options.1.label") },
            ],
        },
        {
            id: "state",
            defaultOption: t("state.defaultOption"),
            options: [
                { value: "Montevideo", label: t("state.options.0.label") },
                { value: "Buenos Aires", label: t("state.options.1.label") },
            ],
        },
        {
            id: "role",
            defaultOption: t("role.defaultOption"),
            options: [
                { value: "Instrumentalist", label: t("role.options.0.label") },
                { value: "Singer", label: t("role.options.1.label") },
                { value: "DJ", label: t("role.options.2.label") },
                { value: "Producer", label: t("role.options.3.label") },
                { value: "Composer", label: t("role.options.4.label") },
            ],
        },
        {
            id: "instrument",
            defaultOption: t("instrument.defaultOption"),
            options: [
                { value: "Guitar", label: t("instrument.options.0.label") },
                { value: "Piano", label: t("instrument.options.1.label") },
                { value: "Drums", label: t("instrument.options.2.label") },
            ],
        },
    ];

    return (
        <div className="w-full py-4 flex flex-col items-center bg-gradient-to-l to-gray-900">
            {/* Search Form */}
            <form onSubmit={handleSubmit(() => {})} className="mb-5 w-full max-w-md flex flex-col gap-2">
                <div className="flex items-center justify-center gap-4">
                    <input
                        type="text"
                        {...register("searchTerm")}
                        placeholder={t("search")}
                        className="border rounded-lg p-2 focus:outline-none focus:ring"
                    />
                    <button
                        type="button"
                        aria-label={showFilters ? "Hide filters" : "Show filters"}
                        onClick={() => setShowFilters((prev) => !prev)}
                        className={`p-2 rounded-lg border border-gray-100 transition-colors ${showFilters ? "bg-sky-600" : "bg-transparent"} hover:bg-sky-700 focus:outline-none focus:ring`}
                        style={{ minWidth: 40 }}
                    >
                        <FiFilter size={22} className={showFilters ? "text-white" : "text-gray-400"} />
                    </button>
                </div>
                {showFilters && (
                    <div className="flex gap-4 mt-4 justify-center flex-wrap animate-fade-in">
                        {filterConfigs.map((filter) => (
                            <Select
                                key={filter.id}
                                id={filter.id}
                                label={null}
                                defaultOption={filter.defaultOption}
                                options={filter.options}
                                register={register}
                                className="!min-w-[210px]"
                            />
                        ))}
                    </div>
                )}
            </form>

            {/* Profiles List */}
            <ProfilesList profiles={profilesToShow} isSearching={isSearching} />

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

export default ProfilesSearch;
