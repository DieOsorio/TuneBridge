import { useTranslation } from "react-i18next";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import RoleEditor from "./RoleEditor";

const DjEditor = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const { 
    fetchDj, 
    addDj, 
    updateDj, 
    deleteDj 
  } = useDjDetails();
  const { data: djDetails, refetch } = fetchDj(role.id);

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
      addDetails={(details) => addDj({details: sanitizeInput(details)})} // Sanitize input before adding
      updateDetails={(id, details) => updateDj({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteDj({id})}
      title={t("roles.detailsTitle", {role:t("roles.dj").toLowerCase()})}
      fields={[
        {
          name: "events_played",
          label: t("fields.eventsPlayed"),
          placeholder: t("placeholders.eventsPlayed"),
          required: true,
        },
        {
          name: "preferred_genres",
          label: t("fields.preferredGenres"),
          placeholder: t("placeholders.preferredGenres"),
        },
        {
          name: "level",
          label: t("fields.level"),
          type: "select",
          options: [
            { value: "Beginner", label: t("levels.beginner") }, 
            { value: "Intermediate", label: t("levels.intermediate") }, 
            {value: "Advanced", label: t("levels.advanced") }, 
            { value: "Expert", label: t("levels.expert") }
          ], 
        },
      ]}
    />
  );
};

export default DjEditor;