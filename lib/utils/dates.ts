import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function formatDate(input: string | Date | null | undefined) {
  if (!input) return "—";
  return format(new Date(input), "MMM d, yyyy");
}

export function formatDateTime(input: string | Date | null | undefined) {
  if (!input) return "—";
  return format(new Date(input), "MMM d, yyyy h:mm a");
}

export function relativeTime(input: string | Date) {
  return formatDistanceToNow(new Date(input), { addSuffix: true });
}

/** Group label used by the notifications page: Today / Yesterday / Earlier. */
export function notificationGroup(input: string | Date): "Today" | "Yesterday" | "Earlier" {
  const d = new Date(input);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return "Earlier";
}

export function upcomingLabel(input: string | Date | null | undefined) {
  if (!input) return null;
  const d = new Date(input);
  return format(d, "EEE, MMM d • h:mm a");
}

/** Days between two dates (positive if target is in future). */
export function daysUntil(input: string | Date) {
  const ms = new Date(input).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function isPast(input: string | Date | null | undefined) {
  if (!input) return false;
  return new Date(input).getTime() < Date.now();
}