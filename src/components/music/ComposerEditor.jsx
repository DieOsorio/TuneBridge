import { useTranslation } from "react-i18next";
import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import RoleEditor from "./RoleEditor";

const ComposerEditor = ({ role, profileId }) => {
  const { t } = useTranslation("music")
  const { 
    fetchComposer, 
    addComposer, 
    updateComposer, 
    deleteComposer 
  } = useComposerDetails();
  const { data: composerDetails, refetch } = fetchComposer(role.id)

  const sanitizeInput = (details) => {
    return {
      ...details,
      years_of_experience: details.years_of_experience
        ? parseInt(details.years_of_experience, 10)
        : null, // Convert to null if empty
      composition_style: details.composition_style?.trim() || null, // Trim and convert to null if empty
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={composerDetails || []}
      refetch={refetch}
      addDetails={(details) => addComposer({details: sanitizeInput(details)})} // Sanitize input before adding
      updateDetails={(id, details) => updateComposer({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteComposer({id})}
      title={t("roles.detailsTitle", {role:t("roles.composer").toLowerCase()})}
      fields={[
        {
          name: "composition_style",
          label: t("fields.compositionStyle"),
          placeholder: t("placeholders.compositionStyle"),
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

export default ComposerEditor;