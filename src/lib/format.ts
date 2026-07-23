import { format, formatDistanceToNowStrict, isToday } from "date-fns";

export function formatListTimestamp(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isToday(date)) return format(date, "HH:mm");
  return format(date, "d MMM");
}

export function formatBubbleTimestamp(iso: string): string {
  return format(new Date(iso), "HH:mm");
}

export function formatRelative(iso: string | null): string {
  if (!iso) return "";
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}
