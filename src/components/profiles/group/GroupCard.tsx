import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IoPeople } from "react-icons/io5";

import ProfileAvatar from "../ProfileAvatar";
import { useProfileGroupMembers } from "../../../context/profile/ProfileGroupMembersContext";

import type { ProfileGroup } from "@/context/profile/profileGroupsActions"; 

interface GroupCardProps {
  group: ProfileGroup;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const { t } = useTranslation("profileGroup");
  const { howManyMembers } = useProfileGroupMembers();
  const { data: members } = howManyMembers(group.id);

  return (
    <div
      className="flex flex-col w-64 aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-b to-zinc-900 shadow-md shadow-zinc-900/50 border border-zinc-700/70"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "320px",
      }}
    >
      {/* Image */}
      <Link to={`/group/${group.id}`}>
        <ProfileAvatar
          avatar_url={group.avatar_url}
          alt={`${group.name} avatar`}
          className="w-full h-36 border-b border-zinc-800/70 object-cover transition-all duration-300 hover:scale-105 hover:brightness-110"
          list
          group
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow px-4 py-3 text-center text-white">
        {/* Name & Location */}
        <h3 className="text-lg font-semibold truncate">{group.name}</h3>
        {(group.city || group.country) && (
          <p className="text-sm text-gray-400 mt-0.5">
            {[group.city, group.country].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Members */}
        <div className="flex justify-center items-center gap-2 text-xs text-zinc-400 mt-1">
          <IoPeople className="text-amber-500" />
          <span>{members || 0} {t("groupAbout.stats.members")}</span>
        </div>

        {/* Genres */}
        {group.genres && group.genres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {group.genres.slice(0, 3).map((genre, i) => (
              <span
                key={i}
                className="bg-amber-700/70 text-white text-[11px] px-2 py-0.5 rounded-full"
              >
                {genre}
              </span>
            ))}
            {group.genres.length > 3 && (
              <span className="text-gray-400 text-xs">+{group.genres.length - 3}</span>
            )}
          </div>
        )}


        {/* Button */}
        <Link
          to={`/group/${group.id}`}
          className="mt-auto bg-zinc-800 hover:bg-zinc-700 text-amber-500 font-semibold text-xs py-1.5 rounded-full transition-all duration-200"
        >
          {t("groupItem.viewGroup")}
        </Link>
      </div>
    </div>
  );
};

export default GroupCard;
