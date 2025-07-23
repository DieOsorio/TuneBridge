import AdCard from "./AdCard";
import { useTranslation } from "react-i18next";

import type { MusicianAd } from "../../../context/social/adsActions";

interface AdsListProps {
  ads: MusicianAd[];
}

const AdsList: React.FC<AdsListProps> = ({ ads }) => {
  const { t } = useTranslation("ads");

  if (!ads.length) return <p>{t("adsList.noAds")}</p>;

  return (
    <div className="flex flex-col justify-center sm:flex-row flex-wrap gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdsList;
