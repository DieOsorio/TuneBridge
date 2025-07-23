import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "../../supabase";

import { useNotifications } from "../../context/social/NotificationsContext";
import { useProfile } from "../../context/profile/ProfileContext";

import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";

import type { Notification } from "../../context/social/notificationsActions";


interface Props {
  profileId: string;
}

interface ProfileGroup {
  id: string;
  name: string;
}

const parse = (p: any): any => (typeof p === "string" ? JSON.parse(p) : p || {});

const NotificationsList = ({ profileId }: Props) => {
  const { t } = useTranslation("profile", { keyPrefix: "notifications" });
  const [showAll, setShowAll] = useState(false);

  // ───── data / realtime ─────
  const {
    userNotifications,
    notificationsRealtime,
    updateNotification,
  } = useNotifications();

  const {
    data: notifications = [],
    isLoading,
    error,
  } = userNotifications(profileId);

  notificationsRealtime(profileId);

  // ───── gather author & group ids ─────
  const authorIds = useMemo(
    () =>
      notifications
        .map((n) => n.from_user_id)
        .filter(Boolean)
        .sort(),
    [notifications]
  );

  const groupIds = useMemo(
    () =>
      notifications
        .map((n) => parse(n.payload).group_id)
        .filter(Boolean)
        .sort(),
    [notifications]
  );

  // ───── authors map ─────
  const { profilesMap } = useProfile();
  const { data: authors = {} } = profilesMap(authorIds);

  const nameOf = (id: string): string =>
    authors[id]?.username || authors[id]?.firstname || t("someone");

  // ───── groups map (for group_follow) ─────
  const { data: groupsData = [] } = useQuery<ProfileGroup[]>({
    queryKey: ["notifGroups", groupIds],
    enabled: groupIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .schema("users")
        .from("profile_groups")
        .select("id, name")
        .in("id", groupIds);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const groupsMap = useMemo(() => {
    const map: Record<string, string> = {};
    groupsData.forEach((g) => {
      map[g.id] = g.name;
    });
    return map;
  }, [groupsData]);

  const groupNameOf = (id: string): string => groupsMap[id] || t("aGroup");

  // ───── handlers ─────
  const markRead = async (n: Notification) => {
    if (!n.is_read) {
      await updateNotification({ ...n, is_read: true });
    }
  };

  // ───── states ─────
  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;
  if (notifications.length === 0)
    return <div className="p-4 max-w-4xl mx-auto">{t("noNotifications")}</div>;

  // ───── i18n text builder ─────
  const renderText = (n: Notification): string => {
    const payload = parse(n.payload);

    switch (n.type) {
      case "group_follow":
        return t("group_follow", {
          user: nameOf(payload.follower_id),
          group: groupNameOf(payload.group_id),
        });
      default:
        return t(n.type, { user: nameOf(n.from_user_id) });
    }
  };

  // ───── slicing logic ─────
  const listToShow = showAll ? notifications : notifications.slice(0, 10);

  // ───── UI ─────
  return (
    <div className="max-w-4xl mx-auto">
      <ul
        className="divide-y divide-gray-700
                   p-4 bg-gradient-to-l to-gray-900 rounded-lg shadow-md"
      >
        {listToShow.map((n) => (
          <li
            key={n.id}
            onClick={() => markRead(n)}
            className={`py-2 cursor-pointer hover:bg-gray-800 transition ${
              n.is_read ? "text-gray-400" : "text-white font-semibold"
            }`}
          >
            • {renderText(n)}
          </li>
        ))}
      </ul>

      {notifications.length > 10 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 mx-auto block text-sky-400 hover:underline"
        >
          {showAll ? t("seeLess") : t("seeAll")}
        </button>
      )}
    </div>
  );
};

export default NotificationsList;
