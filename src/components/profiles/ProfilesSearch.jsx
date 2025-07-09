import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiUserSearchLine, RiUserSearchFill } from "react-icons/ri";
import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/profile/ProfileContext";

import ProfilesList from "./ProfilesList";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import ErrorMessage from "../../utils/ErrorMessage";
import Select from "../ui/Select";

import {
  useCountries,
  useStates,
  useCities,
} from "../../context/helpers/useCountryCity";

import { Country, State, City } from "country-state-city";

const cleanStateName = (name) =>
  name.endsWith(" Department") ? name.replace(/ Department$/, "") : name;

export default function ProfilesSearch() {
  const { t } = useTranslation("searchProfiles");
  const { user } = useAuth();
  const { searchProfiles, infiniteProfiles } = useProfile();

  const { register, watch, setValue, handleSubmit } = useForm();
  const [showFilters, setShowFilters] = useState(false);

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
    ? cleanStateName(states.find((s) => s.isoCode === stateIso)?.name || stateIso)
    : "";

  const neighborhoodName =
    neighborhood && cities.find((c) => c.name === neighborhood)
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

  if (profileError)
    return (
      <ErrorMessage
        error={profileError.message || "Error when loading profiles."}
      />
    );

  if (profileLoading && !allProfilesData)
    return (
      <div className="flex flex-col gap-4 items-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    );

  const loggedIn = Boolean(user);
  const flatAllProfiles = allProfilesData ? allProfilesData.pages.flat() : [];
  const baseList = loggedIn
    ? flatAllProfiles.filter((p) => p.id !== user.id)
    : flatAllProfiles;

  const filteredSearch = loggedIn
    ? searchResults.filter((p) => p.id !== user.id)
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
              defaultOption={t("country.defaultOption")}
              options={countries.map((c) => ({
                value: c.isoCode,
                label: c.name,
              }))}
              register={register}
              className="!w-[210px]"
              onChange={(e) => {
                setValue("country", e.target.value);
                setValue("state", "");
                setValue("neighborhood", "");
              }}
            />

            <Select
              id="state"
              defaultOption={t("state.defaultOption")}
              options={states.map((s) => ({
                value: s.isoCode,
                label: cleanStateName(s.name),
              }))}
              register={register}
              className="!w-[210px]"
              disabled={!countryIso}
              onChange={(e) => {
                setValue("state", e.target.value);
                setValue("neighborhood", "");
              }}
            />

            <Select
              id="neighborhood"
              defaultOption={t("neighborhood.defaultOption")}
              options={cities.map((c) => ({
                value: c.name,
                label: c.name,
              }))}
              register={register}
              className="!w-[210px]"
              disabled={!stateIso}
            />

            <Select
              id="role"
              defaultOption={t("role.defaultOption")}
              options={roleOptions}
              register={register}
              className="!w-[210px]"
            />

            <Select
              id="instrument"
              defaultOption={t("instrument.defaultOption")}
              options={instrumentOptions}
              register={register}
              className="!w-[210px]"
            />
          </div>
        )}
      </form>

      <ProfilesList profiles={profilesToShow} isSearching={isSearching} />

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
