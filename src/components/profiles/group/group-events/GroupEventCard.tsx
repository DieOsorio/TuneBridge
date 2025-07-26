import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import type { GroupEvent } from "@/context/groups/groupEventsActions";


type Props = {
  event: GroupEvent;
  onClick?: (event: GroupEvent) => void;
};

const GroupEventCard = ({ event, onClick }: Props) => {
  const { t, i18n } = useTranslation("groupEvents");

  const localeMap = {
    en: enUS,
    es: es,
  } as const;

  const currentLocale = localeMap[(i18n.language as keyof typeof localeMap)] || enUS;

  const dateObj = typeof event.start_time === "string" ? new Date(event.start_time) : event.start_time;

  const formattedDateLong = format(dateObj, "PPPPp", { locale: currentLocale });
  const formattedDateShort = format(dateObj, "Pp", { locale: currentLocale });

  const typeColorClass: Record<string, string> = {
    gig: "text-sky-600",
    rehearsal: "text-amber-600",
    meeting: "text-emerald-600",
  };

  const typeClass = typeColorClass[event.type] || "text-gray-400";

  return (
    <div
      onClick={() => onClick?.(event)}
      className="bg-gray-800 hover:bg-gray-700 transition-colors duration-150 rounded-xl p-4 mb-3 shadow-md cursor-pointer"
    >
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm ${typeClass} font-semibold uppercase`}>
          {t(`types.${event.type}`)}
        </span>
        {/* Fecha para desktop (visible en sm y superior) */}
        <span className="hidden sm:inline text-xs text-gray-400">{formattedDateLong}</span>
        {/* Fecha para mobile (visible solo en xs) */}
        <span className="inline sm:hidden text-xs text-gray-400">{formattedDateShort}</span>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
      {event.location && <p className="text-sm text-gray-300">{event.location}</p>}
    </div>
  );
};

export default GroupEventCard;
