import InstrumentEditor from "./InstrumentEditor";
import SingerEditor from "./SingerEditor";
import DjEditor from "./DjEditor";
import ProducerEditor from "./ProducerEditor";
import ComposerEditor from "./ComposerEditor";
import React from "react";

interface RoleDataEditorProps {
  role: { id: string | number; role: string; [key: string]: any };
  profileId: string | number;
}

const RoleDataEditor: React.FC<RoleDataEditorProps> = ({ role, profileId }) => {
  return (
    <div className="mt-4">
      {role.role === "Instrumentalist" && (
        <InstrumentEditor role={role} profileId={String(profileId)} />
      )}
      {role.role === "Singer" && (
        <SingerEditor role={role} profileId={String(profileId)} />
      )}
      {role.role === "DJ" && (
        <DjEditor role={role} profileId={String(profileId)} />
      )}
      {role.role === "Producer" && (
        <ProducerEditor role={role} profileId={String(profileId)} />
      )}
      {role.role === "Composer" && (
        <ComposerEditor role={role} profileId={String(profileId)} />
      )}
    </div>
  );
};

export default RoleDataEditor;
