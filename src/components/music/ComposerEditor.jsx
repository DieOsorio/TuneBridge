import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import RoleEditor from "./RoleEditor";

const ComposerEditor = ({ role, profileId }) => {
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
      title="Composer Detail"
      fields={[
        {
          name: "composition_style",
          label: "Composition Style",
          placeholder: "Enter composition style",
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

export default ComposerEditor;