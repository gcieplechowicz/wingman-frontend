"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Conversation } from "@/lib/types";
import { contactLabel, formatListTimestamp } from "@/lib/format";

export function ConversationList({
  tenantId,
  conversations,
}: {
  tenantId: string;
  conversations: Conversation[];
}) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="w-full md:w-[360px] h-full md:shrink-0 border-r-0 md:border-r border-border flex items-center justify-center px-8 text-center">
        <p className="text-sm text-text-muted">
          No conversations yet. Once a match texts this account on Telegram, it'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[360px] h-full md:shrink-0 border-r-0 md:border-r border-border overflow-y-auto">
      {conversations.map((conversation) => {
        const isActive = pathname.endsWith(conversation.id);
        return (
          <Link
            key={conversation.id}
            href={`/dashboard/${tenantId}/conversations/${conversation.id}`}
            className={`block px-5 py-4 border-b border-border/60 transition-colors ${
              isActive ? "bg-surface-hover conversation-row-active" : "hover:bg-surface"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate flex items-center gap-1.5">
                {conversation.status === "PENDING" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet unread-dot shrink-0" title="Awaiting approval" />
                )}
                {conversation.status === "BLOCKED" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-spark-dim shrink-0" title="Blocked" />
                )}
                {contactLabel(conversation)}
              </span>
              <span className="text-[11px] font-mono text-text-muted shrink-0">
                {formatListTimestamp(conversation.updatedAt)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-snug">
              {conversation.summary ?? "No summary yet — check the full conversation for context."}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
