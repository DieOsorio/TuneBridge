import { useState, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useGroupEventRsvps } from "@/context/groups/GroupEventRsvpsContext";

import Select from "@/components/ui/Select";

type Props = {
  eventId: string;
  userId: string;
  currentStatus?: "attending" | "not_attending" | "pending";
};

const RsvpSelector = ({ eventId, userId, currentStatus }: Props) => {
  const { t } = useTranslation("groupEvents");
  const [status, setStatus] = useState<Props["currentStatus"]>(currentStatus || "pending");
  const { upsertRsvp } = useGroupEventRsvps();

  const validStatuses = ["attending", "not_attending", "pending"] as const;
  type ValidStatus = typeof validStatuses[number];

  const handleChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Props["currentStatus"];
    setStatus(newStatus as ValidStatus);

    try {
      await upsertRsvp({ 
        event_id: eventId, 
        profile_id: userId, 
        status: newStatus as ValidStatus
      });
    } catch (error) {
      alert(t("error_updating_rsvp"));
      setStatus(currentStatus || "pending");
    }
  };

  const handleChangeSync = (e: string | ChangeEvent<HTMLSelectElement>) => {
    if (typeof e === "string") return;

    void handleChange(e);
  };

  const options = [
    { value: "attending", label: t("rsvp.attending") },
    { value: "not_attending", label: t("rsvp.not_attending") },
    { value: "pending", label: t("rsvp.pending") },
  ];

  return (
    <div className="mb-4">
      <Select
        id="rsvp"
        label={t("your_rsvp")}
        onChange={handleChangeSync}
        options={options}
        classForLabel="uppercase"
        className="sm:!w-1/3"
      />
    </div>
  );
};

export default RsvpSelector;
