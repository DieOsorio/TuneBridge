import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white">
      <AppRouter />
    </div>
  );
};

export default App;
