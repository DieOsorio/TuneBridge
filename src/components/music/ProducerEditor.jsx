import { useTranslation } from "react-i18next";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import RoleEditor from "./RoleEditor";

const ProducerEditor = ({ role, profileId }) => {
  const { t } = useTranslation("music")
  const {
    fetchProducer, 
    addProducer, 
    updateProducer, 
    deleteProducer } = useProducerDetails();
    const { data: producerDetails, refetch} = fetchProducer(role.id)

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
      details={producerDetails || []}
      refetch={refetch}
      addDetails={(details) => addProducer({details: sanitizeInput(details)})} // Sanitize input before adding
      updateDetails={(id, details) => updateProducer({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteProducer({id})}
      title={t("roles.detailsTitle", {role:t("roles.producer").toLowerCase()})}
      fields={[
        {
          name: "production_type",
          label: t("fields.productionType"),
          placeholder: t("placeholders.productionType"),
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

export default ProducerEditor;