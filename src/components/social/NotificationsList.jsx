import { useNotifications } from "../../context/social/NotificationsContext";
import ErrorMessage from "../../utils/ErrorMessage";
import Loading from "../../utils/Loading";

function NotificationsList({ profileId }) {
    const { userNotifications, notificationsRealtime, updateNotification } = useNotifications();
    const { data: notifications, isLoading, error } = userNotifications(profileId);

    // Call the notificationsRealtime hook directly
    notificationsRealtime(profileId);

    const handleMarkAsRead = async (notif) => {   
        if (notif.is_read) return;

        await updateNotification({
            ...notif, 
            is_read: true,
        });
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorMessage error={error.message} />;
    if (!notifications || notifications.length === 0) return <div className="p-4 max-w-4xl mx-auto">No notifications.</div>;

    return (
        <ul className="divide-y max-w-4xl mx-auto divide-gray-700 p-4 bg-gradient-to-l to-gray-900 rounded-lg shadow-md">
            {notifications.map((notif) => (
                <li
                    key={notif.id}
                    className="py-2 cursor-pointer hover:bg-gray-800 transition"
                    onClick={() => handleMarkAsRead(notif)}
                >
                    <span className={notif.is_read ? "text-gray-400" : "text-white font-semibold"}>
                        • {notif.message}
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default NotificationsList;
