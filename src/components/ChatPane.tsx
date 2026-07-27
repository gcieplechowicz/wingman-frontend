import Link from "next/link";
import type { Conversation, Message } from "@/lib/types";
import { MessageBubble } from "@/components/MessageBubble";
import { ConversationActions } from "@/components/ConversationActions";
import { contactLabel } from "@/lib/format";

export function ChatPane({
  tenantId,
  conversation,
  messages,
}: {
  tenantId: string;
  conversation: Conversation;
  messages: Message[];
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col h-full">
      <div className="border-b border-border px-4 md:px-6 py-3 md:py-3.5 shrink-0 space-y-3">
        <Link
          href={`/dashboard/${tenantId}/conversations`}
          className="md:hidden inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
        >
          ← All conversations
        </Link>
        <div>
          <p className="font-medium text-sm">{contactLabel(conversation)}</p>
          <p className="text-xs text-text-muted">{messages.length} messages</p>
        </div>
        <ConversationActions tenantId={tenantId} conversation={conversation} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-3 bg-bg">
        {conversation.summary && (
          <div className="mx-auto max-w-md text-center text-xs text-text-muted bg-surface rounded-full px-4 py-1.5 mb-4">
            {conversation.summary}
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
