import { useMemo, useState, useRef } from "react";
import { useGroupEvents } from "@/context/groups/GroupEventsContext";
import type { GroupEvent } from "@/context/groups/groupEventsActions";
import { useTranslation } from "react-i18next";
import { applyDayCellStyle } from "./custom-calendar-components/CustomCellStyler";
import { applyListEventStyle } from "./custom-calendar-components/CustomListCellStyler";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import "./styles/full-calendar-custom.css";

import Loading from "@/utils/Loading";
import ErrorMessage from "@/utils/ErrorMessage";
import GroupEventCard from "./GroupEventCard";
import GroupEventFormModal from "./GroupEventFormModal";
import GroupEventDetails from "./GroupEventDetails";

import CalendarHeader from "./custom-calendar-components/CalendarHeader";
import CalendarViewSelector from "./custom-calendar-components/CalendarViewSelector";
import CustomEventContent from "./custom-calendar-components/CustomEventContent";

type Props = {
  groupId: string;
  isAdminOrManager?: boolean;
  isMember: boolean;
};

const GroupCalendarScreen = ({
  groupId,
  isAdminOrManager = false,
  isMember,
}: Props) => {
  const { t, i18n } = useTranslation("groupEvents");
  const { fetchGroupEvents } = useGroupEvents();

  const {
    data: events,
    isLoading,
    error,
    refetch: refetchEvents,
  } = fetchGroupEvents(groupId);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GroupEvent | null>(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");

  const calendarRef = useRef<any>(null);
  const [calendarTitle, setCalendarTitle] = useState("");

  const calendarEvents = useMemo(() => {
    if (!events) return [];
    return events.map((event: GroupEvent) => ({
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      extendedProps: {
        description: event.description,
        location: event.location,
        type: event.type,
        fullEvent: event,
      },
    }));
  }, [events]);

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  }, [events]);

  const handleDateClick = (info: any) => {
    if (!isAdminOrManager) return;
    setSelectedDate(info.dateStr);
    setSelectedEvent(null);
    setShowFormModal(true);
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event.extendedProps.fullEvent);
    setSelectedDate(null);
    setShowFormModal(false);
  };

  const handleDatesSet = () => {
    if (!calendarRef.current) return;
    const calendarApi = calendarRef.current.getApi();
    setCalendarTitle(calendarApi.view.title);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error.message} />;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md w-full space-y-6">
      <h2 className="text-2xl rounded-t-md bg-gradient-to-r from-gray-800 py-4 font-bold text-amber-600 text-center">
        {t("calendar.title")}
      </h2>

      <CalendarHeader
        calendarApi={calendarRef.current?.getApi()}
        title={calendarTitle}
      />

      <CalendarViewSelector
        calendarApi={calendarRef.current?.getApi()}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        views={{
          dayGridMonth: { buttonText: "Month" },
          listWeek: { buttonText: "List" },
        }}
        height="auto"
        events={calendarEvents}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        locale={i18n.language}
        windowResize={() => {
          const calendarApi = calendarRef.current.getApi();
          if (window.innerWidth < 640) {
            calendarApi.changeView("listWeek");
            setCurrentView("listWeek");
          } else {
            calendarApi.changeView("dayGridMonth");
            setCurrentView("dayGridMonth");
          }
        }}
        datesSet={handleDatesSet}
        eventContent={({ event, view }) => (
          <CustomEventContent event={event} view={view} />
        )}
        dayCellDidMount={(info) => applyDayCellStyle(info, calendarEvents)}
        eventDidMount={(info) => {
          applyListEventStyle(info);
        }}
      />

      <div>
        <h3 className="text-xl font-semibold text-white mt-8 mb-4">
          {t("calendar.event_list")}
        </h3>

        {sortedEvents.length === 0 ? (
          <p className="text-gray-400">{t("calendar.no_events")}</p>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event) => (
              <GroupEventCard
                key={event.id}
                event={event}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {showFormModal && (
        <GroupEventFormModal
          groupId={groupId}
          onClose={() => {
            setShowFormModal(false);
            setSelectedEvent(null);
            setSelectedDate(null);
            refetchEvents();
          }}
          mode="create"
          initialEvent={
            selectedEvent ??
            (selectedDate
              ? {
                  start_time: `${selectedDate}T12:00`,
                  end_time: `${selectedDate}T14:00`,
                  type: "rehearsal",
                }
              : undefined)
          }
        />
      )}

      {selectedEvent && (
        <GroupEventDetails
          event={selectedEvent}
          isAdminOrManager={isAdminOrManager}
          onClose={() => {
            setSelectedEvent(null);
            refetchEvents();
          }}
        />
      )}
    </div>
  );
};

export default GroupCalendarScreen;
