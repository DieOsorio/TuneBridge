import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProfileAvatar from "../../profiles/ProfileAvatar";
import { Profile } from "../../../context/profile/profileActions";

type MiniProfileCardProps = {
  profile: Pick<Profile, "avatar_url" | "username" | "gender">;
  onAdd: () => void;
};

const MiniProfileCard = ({ profile, onAdd }: MiniProfileCardProps) => {
  const { t } = useTranslation("common");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
  };

  return (
    <div className="flex items-center justify-between p-2 gap-2 bg-neutral-900 rounded-lg border border-neutral-700">
      <div className="flex items-center gap-2">
        <ProfileAvatar
          avatar_url={profile.avatar_url}
          alt={profile.username}
          className="!w-8 !h-8"
          gender={profile.gender}
        />
        <span className="text-sm text-white">{profile.username}</span>
      </div>
      {added ? (
        <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-md">
          {t("generic.added")}
        </span>
      ) : (
        <button
          onClick={handleAdd}
          className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
        >
          {t("generic.add")}
        </button>
      )}
    </div>
  );
};

export default MiniProfileCard;
