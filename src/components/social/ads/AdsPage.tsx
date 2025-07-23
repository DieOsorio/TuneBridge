import { useState } from "react";
import { AdsFiltersPanel } from "./AdsFiltersPanel";
import { useAds } from "../../../context/social/adsContext";
import { useTranslation } from "react-i18next";

import AdsList from "./AdsList";
import ShinyText from "../../ui/ShinyText";
import ErrorMessage from "../../../utils/ErrorMessage";
import PlusButton from "../../ui/PlusButton";
import AdsListSkeleton from "./skeletons/AdsListSkeleton";

import type { MusicianAd, Filters } from "../../../context/social/adsActions";
import type { UseQueryResult } from "@tanstack/react-query";

type AdType = "all" | "looking" | "offering";


const AdsPage: React.FC = () => {
  const { t } = useTranslation("ads");

  const [selectedTab, setSelectedTab] = useState<AdType>("all");
  const [filters, setFilters] = useState<Filters>({
    adType: null,
    lookingFor: [],
    genres: [],
    locations: null,
    search: "",
  });

  const { fetchAllAds, searchMusicianAds } = useAds();

  const queryResult: UseQueryResult<MusicianAd[], Error> = filters.search.trim()
    ? searchMusicianAds(filters.search)
    : fetchAllAds();

  const { data: ads = [], isLoading, error } = queryResult;

  const filteredAds = selectedTab === "all"
    ? ads
    : ads.filter(ad => ad.ad_type === selectedTab);

  const tabClasses = (tab: AdType) => {
    const base = "px-4 py-2 rounded-md border-b-2 text-sm text-gray-400 hover:text-gray-100 font-medium cursor-pointer transition-colors";
    const isSelected = selectedTab === tab;

    const selectedColor: Record<AdType, string> = {
      all: "border-amber-700",
      looking: "border-sky-600",
      offering: "border-emerald-600",
    };

    return `${base} ${isSelected ? `${selectedColor[tab]} !text-gray-100` : "text-gray-400"}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex-1">
        <div className="text-center">
          <ShinyText text={t("adsPage.title")} speed={3} className="text-3xl font-semibold tracking-wide" />
        </div>

        <div className="max-w-md mx-auto mt-4">
          <AdsFiltersPanel
            filters={filters}
            setFilters={setFilters}
            placeholder={t("adsPage.filters.placeholder")}
          />
        </div>

        <div className="flex justify-center gap-6 my-4">
          <button className={tabClasses("all")} onClick={() => setSelectedTab("all")}>
            {t("adsPage.nav.all")}
          </button>
          <button className={tabClasses("looking")} onClick={() => setSelectedTab("looking")}>
            {t("adsPage.nav.looking")}
          </button>
          <button className={tabClasses("offering")} onClick={() => setSelectedTab("offering")}>
            {t("adsPage.nav.offering")}
          </button>
        </div>

        <PlusButton
          label={t("adsPage.buttons.createAd")}
          to="/ads/new"
        />

        {error && <ErrorMessage error={error.message} />}
        {isLoading ? (
          <AdsListSkeleton />
        ) : (
          <AdsList ads={filteredAds} />
        )}
      </div>
    </div>
  );
};

export default AdsPage;
