import { api } from "@/lib/api";
import { ConversationList } from "@/components/ConversationList";

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
    <div className="h-full flex">
      <ConversationList tenantId={tenantId} conversations={page.content} />
      {children}
    </div>
  );
}
