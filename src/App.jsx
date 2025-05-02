import AppRouter from "./routes/AppRouter";
import { useTheme } from "./context/ThemeContext";

const App = () => {
  const { theme } = useTheme(); // Access theme from context

  return (
    <div
      className={`flex flex-col min-h-screen ${
        theme === "dark" ? "bg-gradient-to-b from-gray-950 to-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <AppRouter />
    </div>
  );
};

export default App;
