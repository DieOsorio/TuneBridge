import { fetchDjQuery } from "../../context/music/djDetailsActions";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import RoleEditor from "./RoleEditor";

const DjEditor = ({ role, profileId }) => {
  const { data: djDetails } = fetchDjQuery(role.id);
  const { refetch, addDj: addDetails, updateDj: updateDetails, deleteDj: deleteDetails } = useDjDetails();

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
      details={djDetails || []}
      refetch={refetch}
      addDetails={(details) => addDetails({details: sanitizeInput(details)})} // Sanitize input before adding
      updateDetails={(id, details) => updateDetails({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteDetails({id})}
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