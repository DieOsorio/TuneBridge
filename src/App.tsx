import { useEffect } from "react";
import { useSettings } from "./context/settings/SettingsContext";
import AppRouter from "./routes/AppRouter";
import Loading from "./utils/Loading";
import useLastSeen from "./utils/useLastSeen";
import { usePrivacySettingsQuery } from "./context/settings/settingsActions";

const App: React.FC = () => {
  const { privacyPrefs } = useSettings();
  const profileId = privacyPrefs?.profile_id ?? "__empty__";
  const { isLoading } = usePrivacySettingsQuery(profileId);

  useLastSeen(privacyPrefs?.show_last_seen);

  if (isLoading) return <Loading />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white light:from-gray-300 light:to-gray-200 light:text-gray-900">
      <AppRouter />
    </div>
  );
};

export default App;
