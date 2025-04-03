import { useProducerDetails } from "../../context/music/ProducerDetailsContext";
import RoleEditor from "./RoleEditor";

const ProducerEditor = ({ role, profileId }) => {
  const { producerDetails, fetchDetails, addDetails, updateDetails, deleteDetails } =
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
      details={producerDetails}
      fetchDetails={fetchDetails}
      addDetails={(details) => addDetails(sanitizeInput(details))} // Sanitize input before adding
      updateDetails={(id, details) => updateDetails(id, sanitizeInput(details))} // Sanitize input before updating
      deleteDetails={deleteDetails}
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