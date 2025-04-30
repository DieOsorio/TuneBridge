import { useNotifications } from "../../context/social/NotificationsContext";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";

function NotificationsList({ profileId }) {
    const { userNotifications, notificationsRealtime, updateNotification } = useNotifications();
    const { data: notifications, isLoading, error } = userNotifications(profileId);

    // Call the notificationsRealtime hook directly
    notificationsRealtime(profileId);

    const handleMarkAsRead = async (notifId) => {     
        await updateNotification({id: notifId, updatedFields:{ is_read: true }});
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error.message} />;
    if (!notifications || notifications.length === 0) return <div className="p-4">No notifications.</div>;

    return (
        <ul className="divide-y divide-gray-200 p-4 bg-white rounded-lg shadow-md">
            {notifications.map((notif) => (
                <li
                    key={notif.id}
                    className="py-2 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleMarkAsRead(notif.id)}
                >
                    <span className={notif.is_read ? "text-gray-500" : "text-black font-semibold"}>
                        {notif.message}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default NotificationsList;
