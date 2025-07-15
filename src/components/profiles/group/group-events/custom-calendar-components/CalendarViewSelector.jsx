const CalendarViewSelector = ({ calendarApi, currentView, setCurrentView }) => {
  if (!calendarApi) return null;

  const handleChangeView = (view) => {
    if (!calendarApi) return;
    calendarApi.changeView(view);
    setCurrentView(view); 
  };

  return (
    <div className="flex gap-2 justify-center sm:justify-end mt-2">
      <button
        onClick={() => handleChangeView("dayGridMonth")}
        className={`px-3 py-1 rounded cursor-pointer hidden sm:inline-block ${
          currentView === "dayGridMonth" ? "bg-slate-600 text-white" : "!bg-transparent text-gray-300"
        }`}
      >
        Month
      </button>
      <button
        onClick={() => handleChangeView("listWeek")}
        className={`px-3 py-1 rounded cursor-pointer ${
          currentView === "listWeek" ? "bg-slate-600 text-white" : "bg-transparent text-gray-300"
        }`}
      >
        List
      </button>
    </div>
  );
};

export default CalendarViewSelector;
