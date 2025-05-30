import { useTranslation } from "react-i18next";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import RoleEditor from "./RoleEditor";

const SingerEditor = ({ role, profileId }) => {
  const { t } = useTranslation("music");
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
      title={t("roles.detailsTitle", {role:t("roles.singer").toLowerCase()})}
      fields={[
        {
          name: "voice_type",
          label: t("fields.voiceType"),
          placeholder: t("placeholders.voiceType"),
          required: true,
        },
        {
          name: "music_genre",
          label: t("fields.musicGenre"),
          placeholder: t("placeholders.musicGenre"),
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

export default SingerEditor;