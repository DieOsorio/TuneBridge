import { useTranslation } from "react-i18next";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import RoleEditor from "./RoleEditor";
import React from "react";

interface ProducerEditorProps {
  role: any;
  profileId: string;
}

const ProducerEditor: React.FC<ProducerEditorProps> = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const {
    fetchProducerById,
    addProducer,
    updateProducer,
    deleteProducer,
  } = useProducerDetails();
  const { data: producerDetails, refetch } = fetchProducerById(role.id);

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
      details={Array.isArray(producerDetails) ? producerDetails : []}
      refetch={refetch}
      addDetails={(details: any) => addProducer({ details: sanitizeInput(details) })}
      updateDetails={(id: string | number, details: any) => updateProducer({ id: String(id), details: sanitizeInput(details) })}
      deleteDetails={(id: string | number) => deleteProducer({ id: String(id), roleId: role.id })}
      title={t("roles.detailsTitle", { role: t("roles.producer").toLowerCase() })}
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
            { value: "Advanced", label: t("levels.advanced") },
            { value: "Expert", label: t("levels.expert") },
          ],
        },
      ]}
    />
  );
};

export default ProducerEditor;
