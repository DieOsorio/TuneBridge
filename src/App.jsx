import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#3695ba] text-white">
      <AppRouter />
    </div>
  );
};

export default App;
