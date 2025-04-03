import { useInstruments } from "../../context/music/InstrumentDetailsContext";
import RoleEditor from "./RoleEditor";

const InstrumentEditor = ({ role, profileId }) => {
  const { instruments, fetchInstruments, addInstrument, updateInstrument, deleteInstrument } =
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
      details={instruments}
      fetchDetails={fetchInstruments}
      addDetails={(details) => addInstrument(sanitizeInput(details))} // Sanitize input before adding
      updateDetails={(id, details) => updateInstrument(id, sanitizeInput(details))} // Sanitize input before updating
      deleteDetails={deleteInstrument}
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
          options: ["Beginner", "Intermediate", "Advanced"], // Not required
        },
      ]}
    />
  );
};

export default InstrumentEditor;