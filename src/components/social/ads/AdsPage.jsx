import { useState } from "react";
import { AdsFiltersPanel } from "./AdsFiltersPanel";
import AdsList from "./AdsList";
import { useAds } from "../../../context/social/adsContext"
import ShinyText from "../../ui/ShinyText";
import { useTranslation } from "react-i18next";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import PlusButton from "./PlusButton";

const AdsPage = () => {
  const { t } = useTranslation("ads");
  const [selectedTab, setSelectedTab] = useState("all"); // 'all' | 'looking' | 'offering'
  const [filters, setFilters] = useState({
    adType: null,
    lookingFor: [],
    genres: [],
    locations: null,
    search: "",
  });

  const { fetchAllAds } = useAds();
  const { data: ads = [], isLoading, error } = fetchAllAds();

  const filteredAds = selectedTab === "all"
    ? ads
    : ads.filter(ad => ad.ad_type === selectedTab);

  const tabClasses = (tab) => {
  const base = "px-4 py-2 rounded-md border-b-2 text-sm text-gray-400 hover:text-gray-100 font-medium cursor-pointer transition-colors";
  const isSelected = selectedTab === tab;

  const selectedColor = {
    all: "border-amber-700",
    looking: "border-sky-600",
    offering: "border-emerald-600",
  }[tab];

  return `${base} ${
    isSelected
      ? `${selectedColor} !text-gray-100`
      : "text-gray-400"
    }`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {/* <div className="md:w-1/4"> */}
        {/* <AdsFiltersPanel filters={filters} setFilters={setFilters} /> */}
      {/* </div> */}
      <div className="flex-1">
        <div className="text-center">
          <ShinyText text={t("adsPage.title")} speed={3} className="text-3xl font-semibold tracking-wide"/>
        </div>

        {/* Tabs */}
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

        {isLoading && <Loading />}
        {error && <ErrorMessage error={error.message} />}
        {!isLoading && !error && <AdsList ads={filteredAds} />}
      </div>
    </div>
  );
};

export default AdsPage;
