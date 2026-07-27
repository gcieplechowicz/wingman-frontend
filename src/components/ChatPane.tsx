import Link from "next/link";
import type { Conversation, Message } from "@/lib/types";
import { MessageList } from "@/components/MessageList";
import { ConversationActions } from "@/components/ConversationActions";
import { ChatMenu } from "@/components/ChatMenu";
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
        <ConversationActions tenantId={tenantId} conversation={conversation} />
      </div>

      <MessageList summary={conversation.summary} messages={messages} />
    </div>
  );
}
