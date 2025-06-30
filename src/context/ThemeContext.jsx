import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSettings } from "./settings/SettingsContext";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const { prefs, saveUiPreferences } = useSettings();  
  const [mode, setModeState] = useState(prefs?.theme || "dark");

  useEffect(() => {
    if (prefs?.theme && prefs.theme !== mode) setModeState(prefs.theme);
  }, [prefs]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.classList.toggle("light", mode === "light");
  }, [mode]);

  const setMode = useCallback(
    async (next) => {
      setModeState(next);
      await saveUiPreferences({ ...prefs, theme: next });
    },
    [prefs, saveUiPreferences]
  );

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
