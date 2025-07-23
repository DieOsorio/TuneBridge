import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { es, enUS } from "date-fns/locale";
import i18n from "../i18n";

/**
 * Formats a timestamp into a relative time string (e.g. "2h ago" / "hace 2h").
 *
 * @param timestamp - ISO string representing the datetime.
 * @returns A localized string with relative time, or null if no timestamp provided.
 */
export default function formatLastSeen(timestamp?: string | null): string | null {
  if (!timestamp) return null;
  const date = parseISO(timestamp); // e.g., "2025-06-30 11:42:16.633453+00"
  const locale = i18n.language.startsWith("es") ? es : enUS;

  return formatDistanceToNowStrict(date, {
    locale,
    addSuffix: true, // → "hace 2 h" | "2 h ago"
  });
}
