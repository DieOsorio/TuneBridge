import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import i18n from "../i18n";

export default function formatLastSeen(timestamp) {
  if (!timestamp) return null;
  const date = parseISO(timestamp); // "2025-06-30 11:42:16.633453+00"
  const locale = i18n.language.startsWith("es") ? es : enUS;

  return formatDistanceToNowStrict(date, {
    locale,
    addSuffix: true  // → "hace 2 h" | "2 h ago"
  });
}
