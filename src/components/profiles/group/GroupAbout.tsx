import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { enUS, es } from "date-fns/locale";

import ProfileAvatar from "../ProfileAvatar";
import type { ProfileGroup } from "@/context/profile/profileGroupsActions";

interface Member {
  profile_id: string;
  profiles?: {
    avatar_url?: string | null;
    username?: string | null;
  };
  role?: string | null;
  roles_in_group?: string[] | null;
  joined_at?: string | null;
}

interface GroupAboutProps {
  group: ProfileGroup;
  members: Member[];
}

const GroupAbout = ({ group, members }: GroupAboutProps) => {
  const { t, i18n } = useTranslation("profileGroup");
  const currentLocale = i18n.language === "es" ? es : enUS;

  return (
    <div className="space-y-6">
      {/* Genres */}
      {group.genres && group.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {group.genres.map((g, i) => (
            <span key={i} className="px-3 py-1 rounded bg-amber-950 text-sm">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold">{members.length}</p>
          <p className="text-gray-400 text-sm">{t("groupAbout.stats.members")}</p>
        </div>

        {/* placeholders for future stats */}
        <div>
          <p className="text-3xl font-bold">—</p>
          <p className="text-gray-400 text-sm">{t("groupAbout.stats.posts")}</p>
        </div>
        <div>
          <p className="text-3xl font-bold">—</p>
          <p className="text-gray-400 text-sm">{t("groupAbout.stats.events")}</p>
        </div>
      </div>

      {/* Members list */}
      <div className="max-h-64 overflow-y-auto border border-amber-700 rounded p-3 bg-amber-900 scrollbar-custom">
        {members.length === 0 ? (
          <p className="text-gray-400 text-center">{t("groupAbout.noMembers")}</p>
        ) : (
          <ul className="space-y-3">
            {members.map((member) => (
              <li
                key={member.profile_id}
                className="flex items-center justify-between bg-gradient-to-r from-amber-950 rounded-2xl p-2 min-h-22 gap-4"
              >
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <ProfileAvatar
                    avatar_url={member.profiles?.avatar_url || ""}
                    className="!w-15 !h-15 rounded-full flex-shrink-0"
                  />
                  <div className="flex flex-col text-gray-300 truncate">
                    <span className="font-semibold truncate">
                      {member.profiles?.username || "Unknown"}
                    </span>
                    <p className="text-sm truncate">
                      {member.role
                        ? t(`groupMembersList.role.${member.role.toLowerCase()}`, { defaultValue: member.role })
                        : member.role}
                    </p>
                    {member.roles_in_group && member.roles_in_group.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.roles_in_group.map((r, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-800 text-white text-xs px-2 py-0.5 rounded-full"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* additional info */}
                <div className="hidden md:flex flex-col items-end text-gray-300 text-xs min-w-[100px]">
                  <span>
                    {member.joined_at
                      ? t("groupAbout.joined", {
                          days: formatDistanceToNow(new Date(member.joined_at), {
                            addSuffix: true,
                            locale: currentLocale,
                          }),
                        })
                      : t("groupAbout.joinedNA")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupAbout;
