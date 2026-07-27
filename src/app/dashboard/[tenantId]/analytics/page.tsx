import { api } from "@/lib/api";
import { formatReplySeconds } from "@/lib/format";
import { MessageVolumeChart } from "@/components/MessageVolumeChart";

export default async function TenantAnalyticsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const analytics = await api.getAnalytics(tenantId);
  const { responseRate, replyTimes, messageVolume } = analytics;

  return (
    <main className="h-full overflow-y-auto px-4 md:px-10 py-6 md:py-10 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-text-muted mt-1">
          Computed from your existing conversation history — nothing new is tracked.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Response rate"
          value={responseRate.totalCount === 0 ? "—" : `${Math.round((responseRate.activeRate ?? 0) * 100)}%`}
          detail={
            responseRate.totalCount === 0
              ? "No approved conversations yet"
              : `${responseRate.totalCount - responseRate.quietCount} of ${responseRate.totalCount} still active, ${responseRate.quietCount} gone quiet (24h+)`
          }
        />
        <StatTile
          label="Your reply speed"
          value={formatReplySeconds(replyTimes.assistantMedianReplySeconds)}
          detail="Median time from their message to your assistant's reply"
        />
        <StatTile
          label="Their reply speed"
          value={formatReplySeconds(replyTimes.contactMedianReplySeconds)}
          detail="Median time from your assistant's reply to their next message"
        />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold mb-1">Message volume</h2>
        <p className="text-sm text-text-muted mb-4">Last 30 days, across every conversation.</p>
        <MessageVolumeChart data={messageVolume} />
      </div>
    </main>
  );
}

function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl px-5 py-4">
      <p className="text-xs font-mono uppercase tracking-wide text-text-muted">{label}</p>
      <p className="font-display text-3xl font-semibold mt-1.5">{value}</p>
      <p className="text-xs text-text-muted mt-1.5 leading-snug">{detail}</p>
    </div>
  );
}
