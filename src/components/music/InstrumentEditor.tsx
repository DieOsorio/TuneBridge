import { useTranslation } from "react-i18next";
import { useInstrumentsDetails } from "../../context/music/InstrumentDetailsContext";
import RoleEditor from "./RoleEditor";
import React from "react";

interface InstrumentEditorProps {
  role: any;
  profileId: string;
}

const InstrumentEditor: React.FC<InstrumentEditorProps> = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const {
    fetchInstruments,
    addInstrument,
    updateInstrument,
    deleteInstrument,
  } = useInstrumentsDetails();
  const { data: instruments, refetch } = fetchInstruments(role.id);

  const sanitizeInput = (details: any) => {
    return {
      ...details,
      years_of_experience: details.years_of_experience
        ? parseInt(details.years_of_experience, 10)
        : null,
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={Array.isArray(instruments) ? instruments : []}
      refetch={refetch}
      addDetails={(details: any) => addInstrument({ details: sanitizeInput(details) })}
      updateDetails={(id: string | number, details: any) => updateInstrument({ id: String(id), details: sanitizeInput(details) })}
      deleteDetails={(id: string | number) => deleteInstrument({ id: String(id) })}
      title={t("roles.detailsTitle", { role: t("fields.instrument").toLowerCase() })}
      fields={[
        {
          name: "instrument",
          label: t("fields.instrument"),
          placeholder: t("placeholders.instrument"),
          required: true,
        },
        {
          name: "years_of_experience",
          label: t("fields.yearsOfExperience"),
          type: "number",
          placeholder: t("placeholders.yearsOfExperience"),
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

export default InstrumentEditor;
