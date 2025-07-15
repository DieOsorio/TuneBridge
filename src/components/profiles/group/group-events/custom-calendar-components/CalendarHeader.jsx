const CalendarHeader = ({ calendarApi, title }) => {
  if (!calendarApi) return null;

  return (
    <div className="mb-4 select-none">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => calendarApi.prev()}
          className="px-3 py-1 cursor-pointer text-slate-400 rounded hover:text-slate-300"
          type="button"
          aria-label="Previous"
        >
          Prev
        </button>

        <div className="font-semibold text-sm sm:text-lg text-white">{title}</div>

        <button
          onClick={() => calendarApi.next()}
          className="px-3 py-1 cursor-pointer text-slate-400 rounded hover:text-slate-300"
          type="button"
          aria-label="Next"
        >
          Next
        </button>
      </div>

      {/* Second row: Today centered */}
      <div className="flex justify-center">
        <button
          onClick={() => calendarApi.today()}
          className="px-4 py-1 cursor-pointer w-full text-slate-400 rounded hover:text-slate-300"
          type="button"
          aria-label="Today"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader