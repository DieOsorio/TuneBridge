import { format } from "date-fns";
import { EventContentArg, ViewApi } from "@fullcalendar/core";

type Props = {
  event: EventContentArg["event"];
  view: ViewApi;
};

const CustomEventContent = ({ event, view }: Props) => {
  const startDate = event.start!;
  const endDate = event.end;
  const formatTime = (date: Date) => format(date, "HH:mm");

  const timeRange = endDate
    ? `${formatTime(startDate)} - ${formatTime(endDate)}`
    : formatTime(startDate);

  if (view.type.startsWith("list")) {
    return (
      <div className="text-white hover:!bg-transparent !flex !flex-col">
        <strong className="truncate">{event.title}</strong>
        <span className="text-xs mt-0.5">{timeRange}</span>
      </div>
    );
  }

  return (
    <div className="m-auto text-center hover:!bg-transparent">
      <strong>{event.title}</strong>
      <div className="text-xs text-gray-300 mt-0.5">{timeRange}</div>
    </div>
  );
};

export default CustomEventContent;
