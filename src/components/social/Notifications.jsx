import { useView } from "../../context/ViewContext";
import NotificationsList from "./NotificationsList";
import ConnectionsList from "./ConnectionsList"; 

function Notifications({ profileId }) {
  const { internalView, setInternalView } = useView();

  return (
    <>
      <div className="bg-gradient-to-b max-w-4xl mx-auto from-gray-800 to-gray-950 text-white p-4 rounded-t-lg h-25">
        <div className="flex space-x-8 justify-center">
          <span
            onClick={() => setInternalView("allNotifications")}
            className={`cursor-pointer px-4 py-2 text-sm sm:text-base text-center rounded-lg font-semibold transition-all duration-300 ${
              internalView === "allNotifications"
                ? "border-b-2 border-sky-600 text-white shadow-lg"
                : "hover:text-sky-600 text-gray-300"
            }`}
          >
            All Notifications
          </span>

          <span
            onClick={() => setInternalView("pending")}
            className={`cursor-pointer px-4 py-2 text-sm sm:text-base text-center rounded-lg font-semibold transition-all duration-300 ${
              internalView === "pending"
                ? "border-b-2 border-sky-600 text-white shadow-lg"
                : "hover:text-sky-600 text-gray-300"
            }`}
          >
            Pending Connections
          </span>
        </div>
      </div>

      {internalView === "pending" && (
        <ConnectionsList profileId={profileId} checkStatus="pending" />
      )}

      {internalView === "allNotifications" && (
        <NotificationsList profileId={profileId} />
      )}
    </>
  );
}

export default Notifications;