import { fetchInstrumentsQuery } from "../../context/music/instrumentDetailsActions";
import { useInstruments } from "../../context/music/InstrumentDetailsContext";
import RoleEditor from "./RoleEditor";

const InstrumentEditor = ({ role, profileId }) => {
  const {data:instruments} = fetchInstrumentsQuery(role.id)
  const { refetch, addInstrument, updateInstrument, deleteInstrument } =
    useInstruments();
  
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
      title="Instrument Detail"
      fields={[
        {
          name: "instrument",
          label: "Instrument",
          placeholder: "Enter instrument name",
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

export default InstrumentEditor;