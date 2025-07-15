import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGroupEventRsvps } from "../../../../context/groups/GroupEventRsvpsContext";
import Select from "../../../ui/Select";

const RsvpSelector = ({ eventId, userId, currentStatus }) => {
  const { t } = useTranslation("groupEvents");
  const [status, setStatus] = useState(currentStatus || "pending");
  const { upsertRsvp } = useGroupEventRsvps();

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await upsertRsvp({ event_id: eventId, profile_id: userId, status: newStatus });
    } catch (error) {
      alert(t("error_updating_rsvp"));
      setStatus(currentStatus || "pending");
    }
  };

  const options = [
    {value: "attending", label: t("rsvp.attending")},
    {value: "not_attending", label: t("rsvp.not_attending")},
    {value: "pending", label: t("rsvp.pending")},
  ]

  return (
    <div className="mb-4">
      <Select 
        id="rsvp"
        label={t("your_rsvp")}
        value={status}
        onChange={handleChange}
        options={options}
        classForLabel="uppercase"
        className="sm:!w-1/3"
      />
    </div>
  );
};

export default RsvpSelector;
