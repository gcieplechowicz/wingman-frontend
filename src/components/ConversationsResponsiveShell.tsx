"use client";

import { usePathname } from "next/navigation";

/**
 * Desktop shows the conversation list and the chat pane side by side, same
 * as always. Mobile doesn't have room for both, so this shows exactly one
 * of them at a time - the list at the base /conversations route, the chat
 * pane once a conversationId segment is in the URL - mirroring the
 * list-then-detail pattern of Telegram/WhatsApp's own mobile apps. List and
 * chat pane are still both server-rendered up front (passed in as already-
 * rendered JSX); this only toggles which one is visible via CSS, so no
 * extra data fetching happens on navigation.
 */
export function ConversationsResponsiveShell({
  tenantId,
  list,
  children,
}: {
  tenantId: string;
  list: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hasActiveConversation = pathname.startsWith(`/dashboard/${tenantId}/conversations/`);

  return (
    <div className="h-full flex">
      <div className={`h-full ${hasActiveConversation ? "hidden md:block" : "block"}`}>{list}</div>
      <div className={`h-full flex-1 min-w-0 ${hasActiveConversation ? "block" : "hidden md:block"}`}>
        {children}
      </div>
    </div>
  );
}
