import ProfileAvatar from "@/components/profiles/ProfileAvatar";
import type { Profile } from "@/context/profile/profileActions";

interface ProfileCardSelectableProps {
  profile: Partial<Profile>;
  isSelected: boolean;
  onSelect: () => void;
  onClear?: () => void;
}

export default function ProfileCardSelectable({
  profile,
  isSelected,
  onSelect,
  onClear,
}: ProfileCardSelectableProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer select-none
        ${isSelected ? "bg-sky-700" : "bg-gray-800 hover:bg-gray-700"}
        border ${isSelected ? "border-sky-600" : "border-transparent"}`}
    >
      <ProfileAvatar
        avatar_url={profile.avatar_url}
        gender={profile.gender}
        className="!w-10 !h-10"
      />
      <div className="flex flex-col">
        <span className="text-white font-semibold">{profile.username}</span>
        <span className="text-gray-300 text-sm select-none">{profile.id}</span>
      </div>
      {isSelected && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="ml-auto text-xs text-white bg-rose-600 rounded px-2 py-1 hover:bg-rose-700 cursor-pointer"
          type="button"
          aria-label="Clear selection"
        >
          Clear
        </button>
      )}
    </div>
  );
}
