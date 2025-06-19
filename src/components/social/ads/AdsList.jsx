import PropTypes from "prop-types";
import AdCard from "./AdCard";
import { useTranslation } from "react-i18next";

const AdsList = ({ ads }) => {
  const { t } = useTranslation("ads")
  if (!ads.length) return <p>{t("adsList.noAds")}</p>;
  
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

AdsList.propTypes = {
  ads: PropTypes.array.isRequired,
};

export default AdsList;
