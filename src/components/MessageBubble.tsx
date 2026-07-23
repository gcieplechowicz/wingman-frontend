import type { Message } from "@/lib/types";
import { formatBubbleTimestamp } from "@/lib/format";

export function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === "ASSISTANT";

  return (
    <div className={`flex ${isAssistant ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2.5 ${isAssistant ? "bubble-out" : "bubble-in"}`}
      >
        <p className="text-[0.925rem] leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-[10px] font-mono mt-1 text-right ${
            isAssistant ? "text-white/70" : "text-text-muted"
          }`}
        >
          {formatBubbleTimestamp(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
