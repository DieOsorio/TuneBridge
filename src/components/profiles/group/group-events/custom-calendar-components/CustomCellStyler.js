export const applyDayCellStyle = (info, calendarEvents) => {
  if (info.el.classList.contains("fc-day-other")) return;

  const dateStr = info.date.toISOString().split("T")[0];
  const eventsForDay = calendarEvents.filter((event) =>
    event.start.startsWith(dateStr)
  );

  info.el.classList.remove(
    "event-gig",
    "event-rehearsal",
    "event-meeting",
    "event-other"
  );

  if (eventsForDay.length > 0) {
    const types = new Set(eventsForDay.map((e) => e.extendedProps.type));

    if (types.has("gig")) {
      info.el.classList.add("event-gig");
    } else if (types.has("rehearsal")) {
      info.el.classList.add("event-rehearsal");
    } else if (types.has("meeting")) {
      info.el.classList.add("event-meeting");
    } else {
      info.el.classList.add("event-other");
    }
  }
};
