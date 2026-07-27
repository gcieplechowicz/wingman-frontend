import { api } from "@/lib/api";
import { ConversationList } from "@/components/ConversationList";
import { ConversationsResponsiveShell } from "@/components/ConversationsResponsiveShell";

export default async function ConversationsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const page = await api.listConversations(tenantId);

  return (
    <ConversationsResponsiveShell
      tenantId={tenantId}
      list={<ConversationList tenantId={tenantId} conversations={page.content} />}
    >
      {children}
    </ConversationsResponsiveShell>
  );
}
