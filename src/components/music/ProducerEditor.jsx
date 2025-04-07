import { fetchProducerQuery } from "../../context/music/ProducerDetailsActions";
import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import RoleEditor from "./RoleEditor";

const ProducerEditor = ({ role, profileId }) => {
  const { data: producerDetails} = fetchProducerQuery(role.id)
  const { refetch, addProducer: addDetails, updateProducer: updateDetails, deleteProducer: deleteDetails } =
    useProducerDetails();

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
      addDetails={(details) => addDetails({details: sanitizeInput(details)})} // Sanitize input before adding
      updateDetails={(id, details) => updateDetails({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteDetails({id})}
      title="Producer Detail"
      fields={[
        {
          name: "production_type",
          label: "Production Type",
          placeholder: "Enter production type",
          required: true,
        },
        {
          name: "years_of_experience",
          label: "Years of Experience",
          type: "number",
          placeholder: "Enter years of experience",
        },
        {
          name: "level",
          label: "Level",
          type: "select",
          options: ["Beginner", "Intermediate", "Advanced"],
        },
      ]}
    />
  );
};

export default ProducerEditor;