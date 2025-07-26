import { useTranslation } from "react-i18next";
import { useComposerDetails } from "../../context/music/ComposerDetailsContext";
import RoleEditor from "./RoleEditor";
import React from "react";

interface ComposerEditorProps {
  role: any;
  profileId: string;
}

const ComposerEditor: React.FC<ComposerEditorProps> = ({ role, profileId }) => {
  const { t } = useTranslation("music");
  const {
    fetchComposer,
    addComposer,
    updateComposer,
    deleteComposer,
  } = useComposerDetails();
  const { data: composerDetails, refetch } = fetchComposer(role.id);

  const sanitizeInput = (details: any) => {
    return {
      ...details,
      years_of_experience: details.years_of_experience
        ? parseInt(details.years_of_experience, 10)
        : null,
      composition_style: details.composition_style?.trim() || null,
    };
  };

  return (
    <RoleEditor
      role={role}
      profileId={profileId}
      details={Array.isArray(composerDetails) ? composerDetails : []}
      refetch={refetch}
      addDetails={(details: any) => addComposer({ details: sanitizeInput(details) })}
      updateDetails={(id: string | number, details: any) => updateComposer({ id: String(id), details: sanitizeInput(details) })}
      deleteDetails={(id: string | number) => deleteComposer({ id: String(id) })}
      title={t("roles.detailsTitle", { role: t("roles.composer").toLowerCase() })}
      fields={[
        {
          name: "composition_style",
          label: t("fields.compositionStyle"),
          placeholder: t("placeholders.compositionStyle"),
          required: true,
        },
        {
          name: "years_of_experience",
          label: t("fields.yearsOfExperience"),
          type: "number",
          placeholder: t("placeholders.yearsOfExperience"),
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

export default ComposerEditor;
