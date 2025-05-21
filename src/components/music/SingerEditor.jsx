import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import RoleEditor from "./RoleEditor";

const SingerEditor = ({ role, profileId }) => {
  // Fetch singer details using the role ID
  // Destructure the functions from the context
  const {
    fetchSinger, 
    addSinger,
    updateSinger,
    deleteSinger
  } = useSingerDetails();
  const { data: singerDetails, refetch } = fetchSinger(role.id);

  // Sanitize input function to trim whitespace and convert empty strings to null  
  const sanitizeInput = (details) => {
    return {
      ...details,
      voice_type: details.voice_type?.trim() || null, // Trim and convert to null if empty
      music_genre: details.music_genre?.trim() || null, // Trim and convert to null if empty
    };
  };

  // Return the RoleEditor component with the necessary props
  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={singerDetails || []}
      refetch={refetch}
      addDetails={(details) => addSinger({ details: sanitizeInput(details) })} // Sanitize input before adding
      updateDetails={(id, details) => updateSinger({id, details: sanitizeInput(details)})} // Sanitize input before updating
      deleteDetails={(id) => deleteSinger({id})}
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
          options: ["Beginner", "Intermediate", "Advanced"],
        },
      ]}
    />
  );
};

export default SingerEditor;