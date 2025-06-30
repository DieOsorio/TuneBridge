import { useEffect } from "react";
import { useSettings } from "./context/settings/SettingsContext";
import AppRouter from "./routes/AppRouter";
import Loading from "./utils/Loading";
import { useTheme } from "./context/ThemeContext";
import useLastSeen from "./utils/useLastSeen"

const App = () => {
  const { privacyPrefs, prefs, isLoading } = useSettings(); // Access theme from backend
  const { setMode } = useTheme();


  useLastSeen(privacyPrefs.show_last_seen); // Initialize last seen tracking

  
  if(isLoading) return <Loading />

  useEffect(() => {
    setMode(prefs.theme || "dark");
  }, [prefs.theme]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white light:from-gray-300 light:to-gray-200 light:text-gray-900" >
      <AppRouter />
    </div>
  );
};

export default App;
