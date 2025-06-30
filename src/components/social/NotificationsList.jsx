import { useTranslation }   from "react-i18next";
import { useNotifications } from "../../context/social/NotificationsContext";
import { useProfile }       from "../../context/profile/ProfileContext";

import ErrorMessage from "../../utils/ErrorMessage";
import Loading      from "../../utils/Loading";

function NotificationsList({ profileId }) {
  const { t } = useTranslation("profile", {keyPrefix: "notifications"});

  /* ───── data / realtime ───── */
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

  /* ───── senders ID's ───── */
  const authorIds = notifications                 
    .map(n => n.from_user_id)
    .filter(Boolean)
    .sort();

    
    
    const { profilesMap } = useProfile();     
    const { data: authors = {} } = profilesMap(authorIds); 
    
    const nameOf = (id) =>
    authors[id]?.username ||
    authors[id]?.firstname ||
    "Someone";

  /* ───── handlers ───── */
  const markRead = async (n) => {
    if (!n.is_read) await updateNotification({ ...n, is_read: true });
  };

  /* ───── states ───── */
  if (isLoading)            return <Loading />;
  if (error)                return <ErrorMessage error={error.message} />;
  if (notifications.length === 0)
    return (
      <div className="p-4 max-w-4xl mx-auto">
        {t("noNotifications")}
      </div>
    );

  /* ───── render helper (i18n) ───── */
  const renderText = (n) =>
    t(n.type, { user: nameOf(n.from_user_id) });  


  return (
    <ul
      className="divide-y max-w-4xl mx-auto divide-gray-700
                 p-4 bg-gradient-to-l to-gray-900 rounded-lg shadow-md"
    >
      {notifications.map((n) => (
        <li
          key={n.id}
          onClick={() => markRead(n)}
          className={`py-2 cursor-pointer hover:bg-gray-800 transition
                      ${n.is_read
                        ? "text-gray-400"
                        : "text-white font-semibold"}`}
        >
          • {renderText(n)}
        </li>
      ))}
    </ul>
  );
}

export default NotificationsList;
