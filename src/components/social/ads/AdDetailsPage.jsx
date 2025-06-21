import { useParams, useNavigate, Link } from "react-router-dom";
import { useAds } from "../../../context/social/adsContext";
import { useProfile} from "../../../context/profile/ProfileContext";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import Button from "../../ui/Button";
import Loading from "../../../utils/Loading";
import ErrorMessage from "../../../utils/ErrorMessage";
import { FiArrowLeft } from "react-icons/fi";
import { handleStartChat } from "../../social/chat/utilis/handleStartChat"
import { useState } from "react";
import { useConversations } from "../../../context/social/chat/ConversationsContext";
import { useParticipants } from "../../../context/social/chat/ParticipantsContext";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useView } from "../../../context/ViewContext";
import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import ConfirmDialog from "../../ui/ConfirmDialog";

const AdDetailsPage = () => {
  const { t } = useTranslation("ads");
  const { user } = useAuth();
  const { id } = useParams();
  const { fetchAd, deleteAd } = useAds();
  const { externalView } = useView();
  const {findConversation, createConversation} = useConversations();
  const { addParticipant } = useParticipants();
  const { data: ad, isLoading: adLoading, error } = fetchAd(id);
  const { fetchProfile } = useProfile();
  const { data: profile, isLoading: profileLoading } = fetchProfile(ad?.profile_id, { enabled: !!ad?.profile_id });
  const navigate = useNavigate();
  const [isStartingChat, setIsStartingChat] = useState(false);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  if (adLoading || profileLoading)
    return (
    <Loading />
  );

  if (error || !ad)
    return (
    <ErrorMessage error={error.message} />
  );
    

  const startChat = () => {
    if(isStartingChat) return;
    handleStartChat({
      myProfileId: user.id,
      otherProfile: profile,
      findConversation,
      createConversation,
      addParticipant,
      navigate,
      setLoading: setIsStartingChat,
    })
  }

  const handleDelete = () => {
    deleteAd(ad);
    setConfirmOpen(false);
    navigate("/ads");
  }

  const handleCancel = () => {
    setConfirmOpen(false);
  };


  const ownAd = user.id === profile.id;

  const isSearching = ad.ad_type === "looking";

  return (
    <div className={`max-w-3xl rounded-md bg-gradient-to-r mx-auto px-4 py-4 space-y-8 ${isSearching ? "from-cyan-950" :"from-emerald-950"}`}>
      {/* Title/Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r bg-black/20 border-b p-2 border-gray-400">
        {/* Top: avatar + edit/delete + badge (mobile layout) */}
        <div className="flex justify-between items-center gap-13">
          {/* Avatar */}
          <Link to={`/profile/${profile.id}`}>          
            <ProfileAvatar
              avatar_url={profile.avatar_url}
              className="!w-12 !h-12"
              gender={profile.gender}
            />
          </Link>

          {/* Title desktop */}
          <h2 className="hidden min-w-100 sm:inline text-2xl tracking-wide mt-3 text-center rounded-lg px-4 py-1 text-gray-100">
            {ad.title}
          </h2>

          {/* Edit/Delete + Badge */}
          <div className="flex flex-col items-end gap-6 sm:flex-row sm:items-center">
            {ownAd && (
              <div className="flex gap-3">
                <Link to={`/ads/edit/${ad.id}`}>
                  <CiEdit
                    size={20}
                    title={t("adCard.buttons.edit")}
                    className="text-yellow-500"
                  />
                </Link>
                <button onClick={() => setConfirmOpen(true)}>
                  <MdDeleteOutline
                    size={20}
                    title={t("adCard.buttons.delete")}
                    className="text-red-500 cursor-pointer"
                  />
                </button>
              </div>
            )}
            
            {/* Badge: visible on all sizes now */}
            <span
              className={`text-sm px-2 min-w-20 py-1 rounded-lg font-medium ${
                isSearching
                  ? "bg-blue-100 text-cyan-700"
                  : "bg-green-100 text-emerald-700"
              }`}
            >
              {isSearching
                ? t("adsDetailsPage.badges.looking")
                : t("adsDetailsPage.badges.offering")}
            </span>
          </div>
        </div>
        {/* Title mobile */}
        <h2 className="text-md max-w-50 tracking-wide text-left sm:hidden sm:text-left p-1 text-gray-100">
          {ad.title}
        </h2>                
      </div>
      {/* General info + author and created at (grid in desktop) */}
      <div className="md:grid md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
        {/* Left Column: Posted by + Created at */}
        <div className="space-y-6 mx-auto">
          <div className="flex gap-4 justify-between sm:justify-start items-center">
            <h2 className="text-lg font-semibold text-gray-400">
              {t("adsDetailsPage.info.postedBy")} :
            </h2>
            <Link to={`/profile/${profile.id}`} className="flex items-center gap-4">
              <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-1">{profile.username}</p>              
            </Link>
          </div>
          <div className="flex gap-4 justify-between sm:justify-start items-center">
            <h2 className="text-lg font-semibold text-gray-400">
              {t("adsDetailsPage.info.from")} :
            </h2>
              <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-1">{profile.country}</p>              
          </div>
          <div className="flex gap-4 justify-between sm:justify-start items-center">
            <h2 className="text-lg font-semibold text-gray-400">
              {t("adsDetailsPage.info.createdAt")} :
            </h2>
            <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-1">
              {new Date(ad.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Columna derecha: Genres + Location */}
        <div className="space-y-6 mx-auto">
          <div className="flex flex-wrap justify-between sm:flex-nowrap sm:justify-start gap-2 sm:gap-4 items-start">
            <h2 className="text-lg font-semibold text-gray-400">
              {t("adsDetailsPage.info.genres")} :
            </h2>
            <p className="text-gray-100 bg-black/20 rounded-lg px-4 py-1 break-words w-fit max-w-full">
              {ad.genres.join(", ") || "—"}
            </p>
          </div>
          <div className="flex gap-4 justify-between sm:justify-start items-center">
            <h2 className="text-lg font-semibold text-gray-400">
              {isSearching ? t("adsDetailsPage.badges.looking") : t("adsDetailsPage.badges.offering")} :
            </h2>
            <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-1">
              {ad.looking_for.join(", ") || "—"}
            </p>
          </div>
          <div className="flex gap-4 justify-between sm:justify-start items-center">
            <h2 className="text-lg font-semibold text-gray-400">
              {t("adsDetailsPage.info.location")} :
            </h2>
            <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-1">
              {ad.location || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* description: bottom, full width*/}
      <div className="space-y-2 pt-6 text-center">
        <h2 className="text-lg font-semibold text-gray-400">
          {t("adsDetailsPage.info.description")} :
        </h2>
        <p className="text-gray-100 rounded-lg bg-black/20 px-6 py-4">
          {ad.description}
        </p>
      </div>


      {/* Actions */}
      <div className="flex justify-between items-center">
        {/* Desktop: text + arrow */}        
        <Link
          to={externalView === "profile" ? `/profile/${profile.id}` : "/ads"}
          className={`group relative items-center justify-end hidden md:flex ${isSearching ? "text-cyan-400 hover:text-cyan-300" : "text-emerald-400 hover:text-emerald-300"} transition-colors text-sm font-medium`}
        >
          <FiArrowLeft size={25} />
        
          <span
            className={`ml-2 whitespace-nowrap ${isSearching ? "text-cyan-500" : "text-emerald-500"} font-semibold text-base px-3 py-1 transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none`}
          >
            {t("adsDetailsPage.buttons.back")}
          </span>
        </Link>

        {/* Mobile: arrow only*/}
        <Link
          to="/ads"
          className={`md:hidden ${isSearching ? "text-cyan-500 hover:text-cyan-400" : "text-emerald-500 hover:text-emerald-400"} transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300`}
          aria-label={t("adsDetailsPage.buttons.back")}
        >
          <FiArrowLeft title={t("adsDetailsPage.buttons.back")} size={22} />
        </Link>

        <Button
          className={`${
            isSearching
              ? "!bg-cyan-700 hover:!bg-cyan-800"
              : "!bg-emerald-600 hover:!bg-emerald-700"
          }`}
          onClick={startChat}
        >
          {t("adsDetailsPage.buttons.contact")}
        </Button>
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

export default AdDetailsPage;
