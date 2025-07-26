import { useTranslation } from "react-i18next";
import { useDjDetails } from "../../context/music/DjDetailsContext";
import RoleEditor from "./RoleEditor";
import React from "react";

interface DjEditorProps {
  role: any;
  profileId: string;
}

const DjEditor: React.FC<DjEditorProps> = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const {
    fetchDj,
    addDj,
    updateDj,
    deleteDj,
  } = useDjDetails();
  const { data: djDetails, refetch } = fetchDj(role.id);

  const sanitizeInput = (details: any) => {
    return {
      ...details,
      events_played: details.events_played?.trim() || null,
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={Array.isArray(djDetails) ? djDetails : []}
      refetch={refetch}
      addDetails={(details: any) => addDj({ details: sanitizeInput(details) })}
      updateDetails={(id: string | number, details: any) => updateDj({ id: String(id), details: sanitizeInput(details) })}
      deleteDetails={(id: string | number) => deleteDj({ id: String(id) })}
      title={t("roles.detailsTitle", { role: t("roles.dj").toLowerCase() })}
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
            { value: "Advanced", label: t("levels.advanced") },
            { value: "Expert", label: t("levels.expert") },
          ],
        },
      ]}
    />
  );
};

export default DjEditor;
