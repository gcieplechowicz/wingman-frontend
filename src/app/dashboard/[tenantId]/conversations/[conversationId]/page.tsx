import { api } from "@/lib/api";
import { ChatPane } from "@/components/ChatPane";

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string; conversationId: string }>;
}) {
  const { tenantId, conversationId } = await params;

  const [conversation, messagesPage] = await Promise.all([
    api.getConversation(conversationId),
    api.listMessages(conversationId),
  ]);

  return <ChatPane tenantId={tenantId} conversation={conversation} messages={messagesPage.content} />;
}
