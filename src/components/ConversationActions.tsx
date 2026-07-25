"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/lib/types";

export function ConversationActions({
  tenantId,
  conversation,
}: {
  tenantId: string;
  conversation: Conversation;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function setStatus(status: "APPROVED" | "BLOCKED" | "PENDING") {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/conversations/${conversation.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/conversations/${conversation.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error(await res.text());
      router.push(`/dashboard/${tenantId}/conversations`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (conversation.status === "PENDING") {
    return (
      <div className="flex items-center gap-2 bg-violet/10 border border-violet/30 rounded-xl px-4 py-2.5">
        <p className="text-xs text-text-primary flex-1">
          New contact — no replies are being sent until you approve them.
        </p>
        <button
          disabled={submitting}
          onClick={() => setStatus("APPROVED")}
          className="text-xs font-medium bg-online/15 text-online px-3 py-1.5 rounded-full hover:bg-online/25 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
        <button
          disabled={submitting}
          onClick={() => setStatus("BLOCKED")}
          className="text-xs font-medium bg-spark/15 text-spark px-3 py-1.5 rounded-full hover:bg-spark/25 transition-colors disabled:opacity-50"
        >
          Block
        </button>
        <DeleteButton confirming={confirmingDelete} submitting={submitting} onClick={handleDelete} />
      </div>
    );
  }

  if (conversation.status === "BLOCKED") {
    return (
      <div className="flex items-center gap-2 bg-spark/10 border border-spark/30 rounded-xl px-4 py-2.5">
        <p className="text-xs text-text-primary flex-1">
          Blocked — this person will never get an auto-reply again.
        </p>
        <button
          disabled={submitting}
          onClick={() => setStatus("APPROVED")}
          className="text-xs font-medium bg-online/15 text-online px-3 py-1.5 rounded-full hover:bg-online/25 transition-colors disabled:opacity-50"
        >
          Unblock
        </button>
        <DeleteButton confirming={confirmingDelete} submitting={submitting} onClick={handleDelete} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={submitting}
        onClick={() => setStatus("BLOCKED")}
        className="text-xs font-medium text-text-muted hover:text-spark transition-colors px-3 py-1.5"
      >
        Block this person
      </button>
      <DeleteButton confirming={confirmingDelete} submitting={submitting} onClick={handleDelete} />
    </div>
  );
}

function DeleteButton({
  confirming,
  submitting,
  onClick,
}: {
  confirming: boolean;
  submitting: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={submitting}
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
        confirming ? "bg-spark text-white" : "text-text-muted hover:text-spark"
      }`}
    >
      {confirming ? "Click again to permanently delete" : "Delete conversation"}
    </button>
  );
}
