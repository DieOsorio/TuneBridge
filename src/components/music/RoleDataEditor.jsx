import React from "react";
import InstrumentEditor from "./InstrumentEditor";
import SingerEditor from "./SingerEditor";
import DjEditor from "./DjEditor";
import ProducerEditor from "./ProducerEditor"; // Import ProducerEditor
import ComposerEditor from "./ComposerEditor"; // Import ComposerEditor

const RoleDataEditor = ({ role, profileId }) => {
  return (
    <div className="mt-4">
      {role.role === "Instrumentalist" && (
        <InstrumentEditor role={role} profileId={profileId} />
      )}
      {role.role === "Singer" && (
        <SingerEditor role={role} profileId={profileId} />
      )}
      {role.role === "DJ" && (
        <DjEditor role={role} profileId={profileId} />
      )}
      {role.role === "Producer" && (
        <ProducerEditor role={role} profileId={profileId} />
      )}
      {role.role === "Composer" && ( // Add case for ComposerEditor
        <ComposerEditor role={role} profileId={profileId} />
      )}
    </div>
  );
};

export default RoleDataEditor;