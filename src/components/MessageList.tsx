"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { MessageBubble } from "@/components/MessageBubble";

const NEAR_BOTTOM_THRESHOLD_PX = 120;

/**
 * Auto-scrolls to the latest message whenever the message list changes
 * (including WebSocket-driven router.refresh() updates) - but only if the
 * user was already near the bottom. If they've scrolled up to read older
 * messages, a new message elsewhere (or an unrelated broadcast causing a
 * refresh) won't yank them back down.
 */
export function MessageList({
  summary,
  messages,
  pendingBuffer,
  pendingMessageCount,
}: {
  summary: string | null;
  messages: Message[];
  pendingBuffer?: string | null;
  pendingMessageCount?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isNearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, pendingBuffer]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-3 bg-bg"
    >
      {summary && (
        <div className="mx-auto max-w-md text-center text-xs text-text-muted bg-surface rounded-full px-4 py-1.5 mb-4">
          {summary}
        </div>
      )}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {pendingBuffer && (
        <div className="flex justify-start">
          <div className="max-w-[88%] sm:max-w-[75%] md:max-w-[70%]">
            <p className="text-[10px] font-mono uppercase tracking-wide text-text-muted mb-1">
              {(pendingMessageCount ?? 1) > 1 ? `${pendingMessageCount} new messages` : "New message"} — not sent to
              your assistant yet
            </p>
            <div className="px-4 py-2.5 rounded-bubble rounded-bl-md bg-surface-raised border-2 border-dashed border-border opacity-70">
              <p className="text-[0.925rem] leading-relaxed whitespace-pre-wrap">{pendingBuffer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
