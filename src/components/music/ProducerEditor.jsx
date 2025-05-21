import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import RoleEditor from "./RoleEditor";

const ProducerEditor = ({ role, profileId }) => {
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
          options: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
      ]}
    />
  );
};

export default ProducerEditor;