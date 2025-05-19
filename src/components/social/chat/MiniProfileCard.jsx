import { useState } from "react";

const MiniProfileCard = ({ profile, onAdd }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-neutral-900 rounded-lg border border-neutral-700">
      <div className="flex items-center gap-2">
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm text-white">{profile.username}</span>
      </div>
      {added ? (
        <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-md">Added</span>
      ) : (
        <button
          onClick={handleAdd}
          className="text-xs px-2 py-1 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
        >
          Add
        </button>
      )}
    </div>
  );
};

export default MiniProfileCard;
