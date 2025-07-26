import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/profile/ProfileContext";
import type { EventRsvp } from "@/context/groups/GroupEventRsvpsActions";

import ProfileAvatar from "../../ProfileAvatar";
import ProfileAvatarSkeleton from "../../skeletons/ProfileAvatarSkeleton";


type RSVPStatus = "attending" | "not_attending" | "pending";

type Props = {
  rsvps: EventRsvp[];
};

const AttendeesList = ({ rsvps }: Props) => {
  const { t } = useTranslation("groupEvents");
  const { profilesMap } = useProfile();

  const profileIds = rsvps.map((rsvp) => rsvp.profile_id);
  const { data: profiles, isLoading } = profilesMap(profileIds);

  const grouped: Record<RSVPStatus, EventRsvp[]> = {
    attending: [],
    not_attending: [],
    pending: [],
  };

  rsvps.forEach((rsvp) => {
    grouped[rsvp.status].push(rsvp);
  });

  const renderUser = (rsvp: EventRsvp) => {
    const profile = profiles?.[rsvp.profile_id];

    return (
      <div key={rsvp.profile_id} className="flex items-center justify-center space-x-3">
        {isLoading || !profile ? (
          <ProfileAvatarSkeleton />
        ) : (
          <>
            <ProfileAvatar
              avatar_url={profile.avatar_url}
              alt={profile.username}
              gender={profile.gender}
              className="!w-11 !h-11"
            />
            <span className="text-sm text-gray-200">{profile.username}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {([
        { label: t("attending"), key: "attending", color: "text-emerald-400" },
        { label: t("not_attending"), key: "not_attending", color: "text-rose-400" },
        { label: t("pending"), key: "pending", color: "text-yellow-400" },
      ] as const).map(({ label, key, color }) => (
        <div key={key} className="bg-gray-800 rounded-lg p-4 shadow-sm space-y-3">
          <h4 className={`text-sm text-center font-semibold uppercase ${color}`}>{label}</h4>
          <div className="space-y-2">
            {grouped[key].length > 0 ? (
              grouped[key].map(renderUser)
            ) : (
              <p className="text-xs text-center text-gray-400 italic">{t("none")}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendeesList;
