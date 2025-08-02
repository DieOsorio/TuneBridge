import { useAuth } from "./context/AuthContext";
import { useSettings } from "./context/settings/SettingsContext";
import { useGlobalMessageListener } from "./context/social/chat/messagesActions";
import AppRouter from "./routes/AppRouter";
import useLastSeen from "./utils/useLastSeen";

const App = () => {
  const { privacyPrefs } = useSettings();
  const { user } = useAuth();

  useLastSeen(privacyPrefs?.show_last_seen);
  useGlobalMessageListener(user?.id);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white light:from-gray-300 light:to-gray-200 light:text-gray-900">
      <AppRouter />
    </div>
  );
};

export default App;
