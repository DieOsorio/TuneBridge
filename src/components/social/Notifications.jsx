import { useView } from '../../context/ViewContext';
import ConnectionsList from './ConnectionsList';

function Notifications({profileId}) {
  const { internalView, setInternalView } = useView();
  
  return (
    <>
      {/* Barra de navegación estilizada */}
      <div className="bg-gray-800 text-white p-4 rounded-lg">
        <div className="max-w-6xl mx-auto flex space-x-8 justify-center">
          <span
              onClick={() => setInternalView("allNotifications")}
              className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
                  internalView === "allNotifications"
                      ? "border-b-4 border-blue-500"
                      : "hover:text-blue-400"
              }`}
          >
              All Notifications
          </span>

          <span
              onClick={() => setInternalView("pending")}
              className={`cursor-pointer text-lg font-medium transition-all duration-300 ${
                  internalView === "pending"
                      ? "border-b-4 border-blue-500"
                      : "hover:text-blue-400"
              }`}
          >
              Pending Connections
          </span>            
        </div>
    </div>
    
      {internalView === "pending" && 
      <ConnectionsList profileId={profileId} checkStatus="pending" />}
    </>
  )
}

export default Notifications;