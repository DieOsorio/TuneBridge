import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import RoleEditor from "./RoleEditor";

const SingerEditor = ({ role, profileId }) => {
  const { singerDetails, fetchDetails, addDetails, updateDetails, deleteDetails } =
    useSingerDetails();

  const sanitizeInput = (details) => {
    return {
      ...details,
      voice_type: details.voice_type?.trim() || null, // Trim and convert to null if empty
      music_genre: details.music_genre?.trim() || null, // Trim and convert to null if empty
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={singerDetails}
      fetchDetails={fetchDetails}
      addDetails={(details) => addDetails(sanitizeInput(details))} // Sanitize input before adding
      updateDetails={(id, details) => updateDetails(id, sanitizeInput(details))} // Sanitize input before updating
      deleteDetails={deleteDetails}
      title="Singer Detail"
      fields={[
        {
          name: "voice_type",
          label: "Voice Type",
          placeholder: "Enter voice type",
          required: true,
        },
        {
          name: "music_genre",
          label: "Music Genre",
          placeholder: "Enter music genre",
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

export default SingerEditor;