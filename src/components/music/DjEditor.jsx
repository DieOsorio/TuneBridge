import { useDjDetails } from "../../context/music/DjDetailsContext";
import RoleEditor from "./RoleEditor";

const DjEditor = ({ role, profileId }) => {
  const { djDetails, fetchDetails, addDetails, updateDetails, deleteDetails } = useDjDetails();

  const sanitizeInput = (details) => {
    return {
      ...details,
      events_played: details.events_played?.trim() || null, // Convert to null if empty
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={djDetails}
      fetchDetails={fetchDetails}
      addDetails={(details) => addDetails(sanitizeInput(details))} // Sanitize input before adding
      updateDetails={(id, details) => updateDetails(id, sanitizeInput(details))} // Sanitize input before updating
      deleteDetails={deleteDetails}
      title="DJ Detail"
      fields={[
        {
          name: "events_played",
          label: "Events Played",
          placeholder: "Enter events played",
          required: true,
        },
        {
          name: "preferred_genres",
          label: "Preferred Genres",
          placeholder: "Enter preferred genres",
        },
        {
          name: "level",
          label: "Level",
          type: "select",
          options: ["Beginner", "Intermediate", "Advanced"], // Not required
        },
      ]}
    />
  );
};

export default DjEditor;