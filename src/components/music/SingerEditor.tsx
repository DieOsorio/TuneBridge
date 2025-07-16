import { useTranslation } from "react-i18next";
import { useSingerDetails } from "../../context/music/SingerDetailsContext";
import RoleEditor from "./RoleEditor";
import React from "react";

interface SingerEditorProps {
  role: { id: string | number; role: string; [key: string]: any };
  profileId: string | number;
}

const SingerEditor: React.FC<SingerEditorProps> = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const {
    fetchSinger,
    addSinger,
    updateSinger,
    deleteSinger,
  } = useSingerDetails();
  const { data: singerDetails, refetch } = fetchSinger(String(role.id));

  // Sanitize input function to trim whitespace and convert empty strings to null
  const sanitizeInput = (details: Record<string, any>) => {
    return {
      ...details,
      voice_type: details.voice_type?.trim() || null,
      music_genre: details.music_genre?.trim() || null,
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={Array.isArray(singerDetails) ? singerDetails : []}
      refetch={refetch}
      addDetails={(details: any) =>
        addSinger({
          details: {
            ...sanitizeInput(details),
            role_id: String(role.id),
            profile_id: String(profileId),
            level: details.level ?? "Beginner",
          }
        })
      }
      updateDetails={(id: string | number, details: any) =>
        updateSinger({
          id: String(id),
          details: sanitizeInput(details)
        })
      }
      deleteDetails={(id: string | number) => deleteSinger({ id: String(id), role_id: String(role.id) })}
      title={t("roles.detailsTitle", { role: t("roles.singer").toLowerCase() })}
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
            { value: "Advanced", label: t("levels.advanced") },
            { value: "Expert", label: t("levels.expert") },
          ],
        },
      ]}
    />
  );
};

export default SingerEditor;
