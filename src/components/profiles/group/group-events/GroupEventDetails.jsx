import { useState } from "react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useGroupEventRsvps } from "../../../../context/groups/GroupEventRsvpsContext";
import { useAuth } from "../../../../context/AuthContext";
import { useTranslation } from "react-i18next";

import Loading from "../../../../utils/Loading";
import ErrorMessage from "../../../../utils/ErrorMessage";
import RsvpSelector from "./RsvpSelector";
import AttendeesList from "./AttendeesList";
import GroupEventFormModal from "./GroupEventFormModal";
import Button from "../../../ui/Button";
import { useGroupEvents } from "../../../../context/groups/GroupEventsContext";

const GroupEventDetails = ({ event, onClose, isAdminOrManager }) => {
  const { t, i18n } = useTranslation("groupEvents");
  const { user } = useAuth();
  const { fetchEventRsvps } = useGroupEventRsvps();
  const { data: rsvps, isLoading: loading, error } = fetchEventRsvps(event.id);
  const { deleteEvent } = useGroupEvents();

  const [showEditModal, setShowEditModal] = useState(false);

  console.log(event.id);
  

  if (!event) return null;

  const handleDelete = async () => {
    try {
      await deleteEvent(event);
      onClose();
    } catch (err) {
      alert(t("error_deleting_event"));
      console.error(err);
    }
  };
  const locale = i18n.language === "es" ? es : enUS;

  const formattedStart = format(new Date(event.start_time), "PPPPp", { locale });
  const formattedEnd = format(new Date(event.end_time), "PPPPp", { locale });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-rose-600 cursor-pointer font-bold text-2xl"
          aria-label={t("close")}
        >
          &times;
        </button>

        <h3 className="text-3xl font-bold text-white mb-3 text-center">{event.title}</h3>

        <div className="text-center text-sm mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full font-medium ${
              event.type === "gig"
                ? "bg-sky-700 text-sky-200"
                : event.type === "rehearsal"
                ? "bg-amber-700 text-amber-200"
                : event.type === "meeting"
                ? "bg-emerald-700 text-emerald-200"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            {t(`types.${event.type}`)}
          </span>
        </div>

        <div className="grid text-center grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <p className="text-gray-400 underline">{t("location")}</p>
            <p className="text-white">{event.location || t("no_location")}</p>
          </div>
          <div>
            <p className="text-gray-400 underline">{t("start")}</p>
            <p className="text-white">{formattedStart}</p>
          </div>
          <div>
            <p className="text-gray-400 underline">{t("end")}</p>
            <p className="text-white">{formattedEnd}</p>
          </div>
        </div>

        {event.description && (
          <div className="mt-4 pt-4 border-t text-center border-gray-700">
            <h4 className="text-sm font-semibold underline text-gray-400 mb-1">
              {t("description")}
            </h4>
            <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
        {loading && <Loading />}
        {error && <ErrorMessage error={error.message} />}

        {rsvps && (
          <div className="space-y-6 mt-10">
            <RsvpSelector
              eventId={event.id}
              userId={user.id}
              currentStatus={rsvps.find((r) => r.profile_id === user.id)?.status}
            />
            <AttendeesList rsvps={rsvps} />
          </div>
        )}

        {isAdminOrManager && (
          <div className="mt-6 flex gap-4 justify-center flex-wrap">
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => setShowEditModal(true)}
            >
              {t("edit")}
            </Button>
            <Button
              className="!bg-red-600 hover:!bg-red-700"
              onClick={handleDelete}
            >
              {t("delete")}
            </Button>
          </div>
        )}
      </div>

      {showEditModal && (
        <GroupEventFormModal
          groupId={event.group_id}
          initialEvent={event}
          mode="edit"
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default GroupEventDetails;
