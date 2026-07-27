import { format, formatDistanceToNowStrict, isToday } from "date-fns";
import type { Conversation } from "@/lib/types";

/**
 * Best available label for a contact: a real name/username/phone if the
 * Telegram sidecar managed to resolve one, otherwise the last-4-digits
 * fallback that's all we had before contact info was fetched.
 */
export function contactLabel(
  conversation: Pick<Conversation, "displayName" | "username" | "phoneNumber" | "externalContactId">
): string {
  if (conversation.displayName) return conversation.displayName;
  if (conversation.username) return `@${conversation.username}`;
  if (conversation.phoneNumber) return conversation.phoneNumber;
  return `Match ···${conversation.externalContactId.slice(-4)}`;
}

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
