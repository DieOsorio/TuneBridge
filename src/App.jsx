import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AppRouter />
    </div>
  );
};

export default App;
