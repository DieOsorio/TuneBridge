import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { MdDeleteOutline } from "react-icons/md";
import { useAds } from "../../../context/social/adsContext";
import ConfirmDialog from "../../ui/ConfirmDialog";
import { useState } from "react";
import Loading from "../../../utils/Loading";

const AdCard = ({ ad, publisherId }) => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();
  const { deleteAd } = useAds();

  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!ad) return <Loading />

  const isLooking = ad.ad_type === "looking";

  const ownAd = ad?.profile_id === user.id || ad?.group_id === publisherId

  const handleDelete = () => {
    deleteAd(ad);
    setConfirmOpen(false);
  }

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <div className={`${isLooking ? "border-cyan-600" : "border-emerald-600"} rounded-2xl border sm:min-w-100 bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className={`text-lg text-left font-semibold ${
          isLooking
            ? "text-cyan-600"
            : "text-emerald-600"
        }`}>
          {ad.title}
        </h3>
        <span
          className={`text-xs font-semibold min-w-20 text-center px-2 py-1 rounded-lg leading-tight ${
            isLooking
              ? "bg-cyan-100 text-cyan-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {isLooking ? t("adCard.badges.looking") : t("adCard.badges.offering")}
        </span>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-100 space-y-1 text-left">
        <p>
          <span className="font-medium text-gray-400">
            {isLooking ? t("adCard.badges.looking") : t("adCard.badges.offering") }  
          </span>{" "}
          {ad.looking_for?.length ? ad.looking_for.join(", ") : "—"}
        </p>
        <p>
          <span className="font-medium text-gray-400">
            {t("adCard.info.genres")}  
          </span>{" "}
          {ad.genres?.length ? ad.genres.join(", ") : "—"}
        </p>
        <p>
          <span className="font-medium text-gray-400">
            {t("adCard.info.location")}  
          </span>{" "}
          {ad.location || "—"}
        </p>
      </div>

      {/* edit / delete / view details */}
      <div className="flex justify-between items-center">
        {ownAd &&
          <div className="flex gap-3">
            <Link to={`/ads/edit/${ad.id}`}>
            <CiEdit
              title={t("adCard.buttons.edit")}
              className="text-yellow-500" 
            />
            </Link>
            <button onClick={() => setConfirmOpen(true)}>
              <MdDeleteOutline
                title={t("adCard.buttons.delete")}
                className="text-red-500 mr-6 cursor-pointer" 
              />
            </button>
          </div>
        }
        <Link
          to={`/ads/${ad.id}`}
          className={`text-sm hover:underline font-medium transition-colors ${
            isLooking
            ? "text-cyan-600 hover:text-cyan-600"
            : "text-emerald-600 hover:text-emerald-600"
          }`}
        >
          {t("adCard.buttons.details")}
        </Link>
      </div>
      <ConfirmDialog 
        isOpen={confirmOpen}
        title={t("confirmDialog.title")}
        message={t("confirmDialog.message")}
        onConfirm={handleDelete}
        onCancel={handleCancel}
        confirmLabel={t("confirmDialog.labels.confirm")}
        cancelLabel={t("confirmDialog.labels.cancel")}
        color="error"
      />
    </div>
  );
};

AdCard.propTypes = {
  ad: PropTypes.shape({
    id: PropTypes.string.isRequired,
    ad_type: PropTypes.string.isRequired,
    looking_for: PropTypes.string.isRequired,
    genres: PropTypes.array.isRequired,
    location: PropTypes.string.isRequired,
  }).isRequired,
};

export default AdCard;
