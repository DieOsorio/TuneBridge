export const applyListEventStyle = (info) => {
  const el = info.el; // <tr class="fc-list-event">
  if (!el || !info.view.type.startsWith("list")) return;

  el.classList.remove(
    "event-gig", 
    "event-rehearsal", 
    "event-meeting", 
    "event-other"
  );

  const type = info.event.extendedProps.type;

  if (type === "gig") {
    el.classList.add("event-gig");
  } else if (type === "rehearsal") {
    el.classList.add("event-rehearsal");
  } else if (type === "meeting") {
    el.classList.add("event-meeting");
  } else {
    el.classList.add("event-other");
  }
};
