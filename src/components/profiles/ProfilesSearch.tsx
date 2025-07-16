import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiUserSearchLine, RiUserSearchFill } from "react-icons/ri";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";

import ProfilesList from "./ProfilesList";
import Select from "../ui/Select";

import {
  useCountries,
  useStates,
  useCities,
} from "../../context/helpers/useCountryCity";

import { Country } from "country-state-city";
import type { Profile } from "../../context/profile/profileActions";

const cleanStateName = (name: string): string =>
  name.endsWith(" Department") ? name.replace(/ Department$/, "") : name;

export default function ProfilesSearch() {
  // Type guard for paginated data
  function isPaginatedProfiles(data: any): data is { pages: Profile[][] } {
    return data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages);
  }
  const { t } = useTranslation("searchProfiles");
  const { user } = useAuth();
  const { searchProfiles, infiniteProfiles } = useProfile();

  const { register, watch, setValue, handleSubmit, control } = useForm();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const countryIso = watch("country");
  const stateIso = watch("state");
  const neighborhood = watch("neighborhood");
  const role = watch("role");
  const instrument = watch("instrument");
  const searchTerm = watch("searchTerm");

  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates(countryIso);
  const { data: cities = [] } = useCities(countryIso, stateIso);

  const countryName = countryIso
    ? Country.getCountryByCode(countryIso)?.name || countryIso
    : "";

  const stateName = stateIso
    ? cleanStateName(states.find((s: any) => s.isoCode === stateIso)?.name || stateIso)
    : "";

  const neighborhoodName =
    neighborhood && cities.find((c: any) => c.name === neighborhood)
      ? neighborhood
      : "";

  let effective = searchTerm || "";
  if (countryName) effective += ` ${countryName}`;
  if (stateName) effective += ` ${stateName}`;
  if (neighborhoodName) effective += ` ${neighborhoodName}`;
  if (role) effective += ` ${role}`;
  if (instrument) effective += ` ${instrument}`;

  const {
    data: allProfilesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: profileLoading,
    error: profileError,
  } = infiniteProfiles();

  const { data: searchResults = [], isLoading: isSearching } =
    searchProfiles(effective.trim() || undefined);

  const flatAllProfiles =
    isPaginatedProfiles(allProfilesData)
      ? allProfilesData.pages.flat()
      : Array.isArray(allProfilesData)
      ? allProfilesData
      : [];
  const baseList = user
    ? flatAllProfiles.filter((p: any) => p.id !== user.id)
    : flatAllProfiles;

  const filteredSearch = user
    ? searchResults.filter((p: any) => p.id !== user.id)
    : searchResults;

  const profilesToShow = isSearching
    ? null
    : effective && filteredSearch.length
    ? filteredSearch
    : effective
    ? []
    : baseList;

  const roleOptions = [
    { value: "Instrumentalist", label: t("role.options.0.label") },
    { value: "Singer", label: t("role.options.1.label") },
    { value: "DJ", label: t("role.options.2.label") },
    { value: "Producer", label: t("role.options.3.label") },
    { value: "Composer", label: t("role.options.4.label") },
  ];

  const instrumentOptions = [
    { value: "Guitar", label: t("instrument.options.0.label") },
    { value: "Piano", label: t("instrument.options.1.label") },
    { value: "Drums", label: t("instrument.options.2.label") },
  ];

  return (
    <div className="w-full py-4 flex flex-col items-center bg-gradient-to-l to-gray-900">
      <form onSubmit={handleSubmit(() => {})} className="w-full max-w-md mb-5">
        <div className="flex items-center justify-center gap-4">
          <input
            {...register("searchTerm")}
            placeholder={t("search")}
            className="border rounded-lg p-2 flex-1 focus:outline-none focus:ring"
          />
          <button
            type="button"
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            title={showFilters ? t("hideFilters") : t("showFilters")}
            onClick={() => setShowFilters((prev) => !prev)}
            className={`p-2 cursor-pointer rounded-full transition-colors ${
              showFilters ? "bg-sky-600" : ""
            }`}
          >
            {showFilters ? (
              <RiUserSearchFill
                size={22}
                className="text-white"
              />
            ) : (
              <RiUserSearchLine
                size={22}
                className="text-gray-400"
              />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap justify-center gap-4 mt-4 animate-fade-in">
            <Select
              id="country"
              label={t("country.defaultOption")}
              options={countries.map((c: any) => ({
                value: c.isoCode,
                label: c.name,
              }))}
              control={control}
              className="!w-[210px]"
            />

            <Select
              id="state"
              label={t("state.defaultOption")}
              options={states.map((s: any) => ({
                value: s.isoCode,
                label: cleanStateName(s.name),
              }))}
              control={control}
              className="!w-[210px]"
            />

            <Select
              id="neighborhood"
              label={t("neighborhood.defaultOption")}
              options={cities.map((c: any) => ({
                value: c.name,
                label: c.name,
              }))}
              control={control}
              className="!w-[210px]"
            />

            <Select
              id="role"
              label={t("role.defaultOption")}
              options={roleOptions}
              control={control}
              className="!w-[210px]"
            />

            <Select
              id="instrument"
              label={t("instrument.defaultOption")}
              options={instrumentOptions}
              control={control}
              className="!w-[210px]"
            />
          </div>
        )}
      </form>

      <ProfilesList 
        profiles={(profilesToShow || []).map((p: Profile) => ({ ...p, username: p.username ?? "" }))} 
        isSearching={isSearching} 
        isLoading={profileLoading}
        error={profileError} 
      />

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
}
