import { useTranslation } from "react-i18next";
import { useInstrumentsDetails } from "../../context/music/InstrumentDetailsContext";
import RoleEditor from "./RoleEditor";

const InstrumentEditor = ({ role, profileId }) => {
  const { t } = useTranslation("music")
  const { 
    fetchInstruments, 
    addInstrument, 
    updateInstrument, 
    deleteInstrument 
  } = useInstrumentsDetails();
  const { data:instruments, refetch } = fetchInstruments(role.id)
  
  const sanitizeInput = (details) => {
    return {
      ...details,
      years_of_experience: details.years_of_experience
        ? parseInt(details.years_of_experience, 10)
        : null, // Convert to null if empty
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={instruments || []}
      refetch={refetch}
      addDetails={(details) => addInstrument({ details: sanitizeInput(details) })} 
      updateDetails={(id, details) => updateInstrument({id, details:sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteInstrument({id})}
      title={t("roles.detailsTitle", {role:t("fields.instrument").toLowerCase()})}
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
            {value: "Advanced", label: t("levels.advanced") }, 
            { value: "Expert", label: t("levels.expert") }
          ], 
        },
      ]}
    />
  );
};

export default InstrumentEditor;