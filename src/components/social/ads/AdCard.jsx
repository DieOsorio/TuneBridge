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
    <div className="rounded-2xl border min-w-70 border-gray-400 bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-100">
          {ad.looking_for}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-lg font-medium leading-tight ${
            isLooking
              ? "bg-blue-100 text-cyan-700"
              : "bg-green-100 text-emerald-700"
          }`}
        >
          {isLooking ? t("adCard.badges.looking") : t("adCard.badges.offering")}
        </span>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-100 space-y-1">
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

      {/* CTA */}
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
          className="text-sm text-sky-600 hover:text-sky-500 hover:underline font-medium transition-colors"
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
