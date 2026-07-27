"use client";

import { useState } from "react";
import Link from "next/link";
import type { Conversation, Message } from "@/lib/types";
import { MessageList } from "@/components/MessageList";
import { ConversationActions } from "@/components/ConversationActions";
import { ChatMenu } from "@/components/ChatMenu";
import { HourlyActivityChart } from "@/components/HourlyActivityChart";
import { contactLabel } from "@/lib/format";

export function ChatPane({
  tenantId,
  conversation,
  messages,
  hourlyActivity,
}: {
  tenantId: string;
  conversation: Conversation;
  messages: Message[];
  hourlyActivity: { hour: number; messageCount: number }[];
}) {
  const [tab, setTab] = useState<"chat" | "activity">("chat");

  const tabClass = (active: boolean) =>
    `text-xs font-medium px-3 py-1 rounded-full transition-colors ${
      active ? "bg-spark text-white" : "text-text-muted hover:text-text-primary"
    }`;

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full">
      <div className="border-b border-border px-4 md:px-6 py-3 md:py-3.5 shrink-0 space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${tenantId}/conversations`}
            aria-label="Back to all conversations"
            title="Back to all conversations"
            className="md:hidden shrink-0 text-text-muted hover:text-text-primary text-lg leading-none"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{contactLabel(conversation)}</p>
            <p className="text-xs text-text-muted">{messages.length} messages</p>
          </div>
          <ChatMenu tenantId={tenantId} conversation={conversation} />
        </div>
        <nav className="flex gap-1 bg-bg rounded-full p-0.5 w-fit">
          <button onClick={() => setTab("chat")} className={tabClass(tab === "chat")}>
            Chat
          </button>
          <button onClick={() => setTab("activity")} className={tabClass(tab === "activity")}>
            Activity
          </button>
        </nav>
        <ConversationActions tenantId={tenantId} conversation={conversation} />
      </div>

      {tab === "chat" ? (
        <MessageList
          summary={conversation.summary}
          messages={messages}
          pendingBuffer={conversation.pendingBuffer}
          pendingMessageCount={conversation.pendingMessageCount}
        />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 bg-bg">
          <HourlyActivityChart data={hourlyActivity} />
        </div>
      )}
    </div>
  );
}
